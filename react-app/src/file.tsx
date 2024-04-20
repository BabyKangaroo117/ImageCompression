import React, { ChangeEvent, useState } from 'react';

const FileInputComponent: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [pixelData, setPixelData] = useState<number[][] | null>(null); 

    const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    setImageSrc(e.target.result);

                    if (e.target.result !== null) {
                        getImageData(e.target.result)
                            .then((data) => {
                                setPixelData(data);
                            })
                            .catch((error) => {
                                console.error('Error reading image data:', error);
                            });
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <input
                type="file"
                accept="image/png"
                onChange={handleFileInputChange}
            />
            {selectedFile && (
                <div>
                    {imageSrc && (
                        <div>
                            <h2>Before Compression:</h2>
                            <img src={imageSrc} alt="Uploaded File" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                        </div>
                    )}
                    {pixelData && (
                        <div>
                            <h2>Pixel Data:</h2>
                            <div>
                                {pixelData.map((row, rowIndex) => (
                                    <div key={rowIndex}>
                                        {row.map((pixel, columnIndex) => (
                                            <span key={columnIndex} style={{ marginRight: '5px' }}>
                                                {pixel}
                                            </span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const getImageData = (imageSrc: string): Promise<number[][] | null> => {
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
                    const a = imageData.data[index + 3];

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

            resolve(pixelData);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageSrc;
    });
};

export default FileInputComponent;
