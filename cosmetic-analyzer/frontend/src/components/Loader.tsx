export default function Loader() {
    return (
        <div className="flex items-center justify-center p-8">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">💄</span>
                </div>
            </div>
        </div>
    );
}
