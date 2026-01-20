import React, { useRef, useState } from "react";
import { analyzeImage } from "../api";

interface UploadCardProps {
    onResult: (result: any) => void;
    onStart: () => void;
    onError: (error: string) => void;
}

export default function UploadCard({ onResult, onStart, onError }: UploadCardProps) {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0];
        if (!f) return;

        // Validate file type
        if (!f.type.startsWith('image/')) {
            onError('Please select a valid image file');
            return;
        }

        // Validate file size (max 10MB)
        if (f.size > 10 * 1024 * 1024) {
            onError('Image size must be less than 10MB');
            return;
        }

        onStart();

        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result as string;
            setPreview(base64);

            try {
                const res = await analyzeImage(base64);
                if (res.ok) {
                    onResult(res.result || res);
                } else {
                    onError(res.error || 'Analysis failed');
                }
            } catch (err: any) {
                console.error('Analysis error:', err);
                onError(err.response?.data?.error || err.message || 'Failed to analyze image. Please try again.');
            }
        };

        reader.onerror = () => {
            onError('Failed to read image file');
        };

        reader.readAsDataURL(f);
    }

    return (
        <div className="text-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                    <span className="text-5xl">📸</span>
                </div>
            </div>

            {/* Preview */}
            {preview && (
                <div className="mb-6 flex justify-center">
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-w-xs max-h-48 rounded-lg shadow-md border-2 border-pink-200"
                    />
                </div>
            )}

            {/* Instructions */}
            <p className="text-gray-600 mb-8 text-lg">
                Upload a clear photo of the ingredient list on your cosmetic product
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <label className="group relative bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-8 py-4 rounded-full cursor-pointer font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                        <span>📁</span>
                        Upload Photo
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        className="hidden"
                    />
                </label>

                <button
                    className="group relative border-2 border-pink-400 text-pink-600 px-8 py-4 rounded-full font-semibold hover:bg-pink-50 transform hover:scale-105 transition-all duration-300"
                    onClick={() => {
                        if (fileRef.current) {
                            fileRef.current.setAttribute('capture', 'environment');
                            fileRef.current.click();
                        }
                    }}
                >
                    <span className="flex items-center gap-2">
                        <span>📷</span>
                        Use Camera
                    </span>
                </button>
            </div>

            {/* Tips */}
            <div className="mt-8 text-left bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>💡</span>
                    Tips for best results:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                    <li>Ensure good lighting and focus</li>
                    <li>Capture the entire ingredient list</li>
                    <li>Avoid shadows and reflections</li>
                    <li>Keep the text horizontal and readable</li>
                </ul>
            </div>
        </div>
    );
}
