import React, { ChangeEvent, useState } from 'react';
import { getImageDataAndCompress } from './huffman_algo';
import { getImageData } from './huffman_algo';
import { createImageFromPixelData } from './huffman_algo';
import { saveAs } from 'file-saver';

const FileInputComponent: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [compressedData, setCompressedData] = useState<Uint8Array | null>(null); // State to store compressed data
    const [displayedImageSrc, setDisplayedImageSrc] = useState<string | null>(null); // State to store displayed image source

    const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onload = async (e) => {
                if (e.target && typeof e.target.result === 'string') {
                    setImageSrc(e.target.result);
                    if (e.target.result !== null) {
                        try {
                            const data = await getImageDataAndCompress(e.target.result);
                            setCompressedData(data);
                        } catch (error) {
                            console.error('Error compressing image data:', error);
                        }
                        getImageData(e.target.result)
                            .then((data) => {
                                const image = createImageFromPixelData(data, 500, 1200)
                                setDisplayedImageSrc(image.src);
                            })
                            .catch((error) => {
                                console.error('Error getting image data:', error);
                            });
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const saveCompressedData = () => {
        if (compressedData) {
            try {
                const blob = new Blob([compressedData], { type: 'application/octet-stream' });
                const fileName = 'compressed_image.bin';

                // Use file-saver library to save the blob
                saveAs(blob, fileName);
                console.log('Compressed data saved successfully!');
            } catch (error) {
                console.error('Error saving compressed data:', error);
            }
        } else {
            console.warn('No compressed data available to save.');
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
                    <p>Selected File: {selectedFile.name}</p>
                    // selected.size gives the size in bytes so we convert it to KB
                    <p>File Size: {selectedFile.size * 0.001} KB</p>
                    {imageSrc && (
                        <div>
                            <img src={imageSrc} alt="Uploaded File" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                        </div>
                    )}
                    <div>
                        <button onClick={saveCompressedData} disabled={!compressedData}>
                            Save Compressed Data
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileInputComponent;
