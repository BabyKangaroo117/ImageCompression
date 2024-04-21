type FrequencyMap = { [key: number]: number };

// Node for Huffman Tree
class HuffmanNode {
    value: number | null;
    frequency: number;
    left: HuffmanNode | null;
    right: HuffmanNode | null;

    constructor(value: number | null, frequency: number) {
        this.value = value;
        this.frequency = frequency;
        this.left = null;
        this.right = null;
    }
}

// Function to calculate frequency of each pixel value
const calculateFrequency = (pixels: number[][]): FrequencyMap => {
    const frequencyMap: FrequencyMap = {};
    pixels.forEach(row => {
        row.forEach(pixel => {
            if (frequencyMap[pixel]) {
                frequencyMap[pixel]++;
            } else {
                frequencyMap[pixel] = 1;
            }
        });
    });

    console.log(frequencyMap)

    return frequencyMap;
};

export {calculateFrequency}

// Function to build Huffman Tree
const buildHuffmanTree = (frequencyMap: FrequencyMap): HuffmanNode | null => {
    const priorityQueue: HuffmanNode[] = [];

    // Push nodes for each pixel value into priority queue
    Object.entries(frequencyMap).forEach(([value, frequency]) => {
        priorityQueue.push(new HuffmanNode(parseInt(value), frequency));
    });

    // Build Huffman Tree
    while (priorityQueue.length > 1) {
        priorityQueue.sort((a, b) => a.frequency - b.frequency);

        const left = priorityQueue.shift()!;
        const right = priorityQueue.shift()!;
        
        const mergedNode = new HuffmanNode(null, left.frequency + right.frequency);
        mergedNode.left = left;
        mergedNode.right = right;

        priorityQueue.push(mergedNode);
    }
    //console.log("Priority Queue: ", priorityQueue)
    return priorityQueue.shift() || null;
};

// Function to generate Huffman Codes
const generateHuffmanCodes = (root: HuffmanNode, code: string = '', codes: { [key: number]: string } = {}): { [key: number]: string } => {
    if (root.value !== null) {
        codes[root.value] = code;
    } else {
        if (root.left) {
            generateHuffmanCodes(root.left, code + '0', codes);
        }
        if (root.right) {
            generateHuffmanCodes(root.right, code + '1', codes);
        }
    }
    console.log("Codes: ", codes)
    return codes;
};

// Function to compress pixel array using Huffman Codes
const compressPixels = (pixels: number[][], codes: { [key: number]: string }): string => {
    let compressedData = '';

    pixels.forEach(row => {
        row.forEach(pixel => {
            compressedData += codes[pixel];
        });
    });

    //console.log("Pixels: ", compressedData)
    return compressedData;
};

const getImageData = (imageSrc: string): Promise<number[][]> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const pixelData: number[][] = [];

            for (let y = 0; y < canvas.height; y++) {
                const row: number[] = [];
                for (let x = 0; x < canvas.width; x++) {
                    const index = (y * canvas.width + x) * 4;
                    const r = imageData.data[index];
                    const g = imageData.data[index + 1];
                    const b = imageData.data[index + 2];

                    // Check if the pixel is grayscale (R = G = B)
                    if (r === g && g === b) {
                        row.push(r);
                    } else {
                        // If not grayscale, push 0 indicating invalid pixel
                        row.push(0);
                    }
                }
                pixelData.push(row);
            }
            console.log(pixelData[0])
            resolve(pixelData);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageSrc;
    });
};

export {getImageData}

const compressImageData = (pixelData: number[][]): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Calculate frequency of each pixel value
        const frequencyMap = calculateFrequency(pixelData);
        console.log(frequencyMap)
        // Build Huffman Tree
        const huffmanTree = buildHuffmanTree(frequencyMap);
        if (!huffmanTree) {
            reject(new Error('Failed to build Huffman tree'));
            return;
        }

        // Generate Huffman Codes
        const huffmanCodes = generateHuffmanCodes(huffmanTree);

        // Compress pixel data using Huffman Codes
        const compressedData = compressPixels(pixelData, huffmanCodes);

        resolve(compressedData);
    });
};

const getImageDataAndCompress = (imageSrc: string): Promise<string | null> => {
    return getImageData(imageSrc)
        .then(compressImageData)
        .catch(error => {
            console.error('Error getting and compressing image data:', error);
            return null;
        });
};
export {getImageDataAndCompress}




const createImageFromPixelData = (pixelData: number[][], width: number, height: number): HTMLImageElement => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // Get the canvas context
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Failed to get canvas context');
    }

    // Iterate through pixel data and draw pixels
    pixelData.forEach((row, y) => {
        row.forEach((pixel, x) => {
            // Draw the pixel at position (x, y) with color 'pixel'
            context.fillStyle = `rgb(${pixel},${pixel},${pixel})`; // Grayscale color
            context.fillRect(x, y, 1, 1); // Draw a single pixel
        });
    });

    // Convert canvas to image
    const image = new Image();
    image.src = canvas.toDataURL('image/png'); // Convert canvas to data URL

    return image;
};

export {createImageFromPixelData}