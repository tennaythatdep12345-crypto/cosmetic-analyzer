import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { analyzeImage } from '../api';
import ResultCard from '../components/ResultCard';

export default function Analyzer() {
    const { t } = useTranslation();
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0];
        if (!f) return;

        if (!f.type.startsWith('image/')) {
            setError(t('analyzer.upload.tips.tip1'));
            return;
        }

        if (f.size > 10 * 1024 * 1024) {
            setError('Image size must be less than 10MB');
            return;
        }

        setLoading(true);
        setResult(null);
        setError(null);

        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = reader.result as string;
            setPreview(base64);

            try {
                const res = await analyzeImage(base64);
                if (res.ok) {
                    setResult(res.result || res);
                } else {
                    setError(res.error || 'Analysis failed');
                }
            } catch (err: any) {
                console.error('Analysis error:', err);
                setError(err.response?.data?.error || err.message || 'Failed to analyze image. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = () => {
            setError('Failed to read image file');
            setLoading(false);
        };

        reader.readAsDataURL(f);
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && fileRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileRef.current.files = dataTransfer.files;
            fileRef.current.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        {t('analyzer.title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        {t('analyzer.subtitle')}
                    </p>
                </header>

                {/* Upload Card */}
                <div
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-6"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <div className="text-center">
                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                            {preview ? (
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="max-w-xs max-h-48 rounded-lg"
                                    />
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            )}
                            <p className="text-gray-700 dark:text-gray-300 mb-1">
                                {t('analyzer.upload.title')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                {t('analyzer.upload.dragDrop')}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <label className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg cursor-pointer font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {t('analyzer.upload.button')}
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFile}
                                    className="hidden"
                                />
                            </label>

                            <button
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => {
                                    if (fileRef.current) {
                                        fileRef.current.setAttribute('capture', 'environment');
                                        fileRef.current.click();
                                    }
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                </svg>
                                {t('analyzer.upload.camera')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-5 mb-6">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('analyzer.upload.tips.title')}
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1.5 ml-7">
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                            {t('analyzer.upload.tips.tip1')}
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                            {t('analyzer.upload.tips.tip2')}
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                            {t('analyzer.upload.tips.tip3')}
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                            {t('analyzer.upload.tips.tip4')}
                        </li>
                    </ul>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-900 px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-800">
                            <div className="w-5 h-5 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-700 dark:text-gray-300">{t('analyzer.analyzing')}</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 rounded-xl mb-6">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="font-medium text-red-800 dark:text-red-300 mb-1">{t('analyzer.error.title')}</h3>
                                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {result && !loading && <ResultCard data={result} />}
            </div>
        </div>
    );
}
