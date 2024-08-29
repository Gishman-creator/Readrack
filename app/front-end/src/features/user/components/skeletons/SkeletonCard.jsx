export function SkeletonCard() {
    return (
        <div className="min-w-[10rem] md:max-w-[10rem] group rounded-md cursor-pointer mb-7 animate-pulse">
            <div className="bg-gray-300 h-48 w-full rounded-sm"></div>
            <div className="flex-col justify-center items-center py-1">
                <div className="bg-gray-300 h-6 w-3/4 mb-2 rounded-md"></div>
                <div className="bg-gray-300 h-4 w-1/2 mb-2 rounded-md"></div>
                <div className="bg-gray-300 h-4 w-1/3 rounded-md"></div>
            </div>
        </div>
    );
}
