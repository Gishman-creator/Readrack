export function SkeletonCard() {
    return (
        <div className="min-w-[10rem] md:max-w-[10rem] group rounded-lg cursor-pointer mb-7 animate-pulse">
            <div className="bg-gray-300 h-48 w-full rounded-lg"></div>
            <div className="flex-col justify-center items-center py-1">
                <div className="bg-gray-300 h-4 w-3/4 mt-1 mb-1 rounded-lg"></div>
                <div className="bg-gray-300 h-2 w-1/2 mb-4 rounded-lg"></div>
                <div className="bg-gray-300 h-3 w-3/5 rounded-lg"></div>
            </div>
        </div>
    );
}
