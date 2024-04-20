import React, { ChangeEvent, useState } from 'react';
import { getImageDataAndCompress } from './huffman_algo';
import { calculateFrequency } from './huffman_algo';
import { getImageData } from './huffman_algo';
import { createImageFromPixelData } from './huffman_algo';

const FileInputComponent: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [compressedData, setCompressedData] = useState<string | null>(null); // State to store compressed data
    const [displayedImageSrc, setDisplayedImageSrc] = useState<string | null>(null); // State to store displayed image source

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
                            const image = createImageFromPixelData(data, 500, 1200)
                            setDisplayedImageSrc(image.src);

                        })


                        getImageDataAndCompress(e.target.result)
                        .then((data) => {
                            //console.log('Compressed data:', data)

                            setCompressedData(data)
                        })
                        // Compress the image data
                        .catch((error) => {
                            console.error('Error compressing image data:', error);
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
                   {compressedData && (
                        <div>
                            <h2>After Compression:</h2>
                            <p>Compressed Data: {compressedData}</p>
                            {/* Display the compressed image */}
                            {displayedImageSrc && (
                                <div>
                                    <h2>Compressed Image:</h2>
                                    <img src={displayedImageSrc} alt="Compressed Image" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileInputComponent;
