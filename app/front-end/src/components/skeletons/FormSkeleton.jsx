// src/components/Skeleton.js
import React from 'react';

const FormSkeleton = () => {
    return (
        <div className="animate-pulse flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
            <div>
                <div className="md:w-[13rem] h-[10rem] bg-gray-300 rounded-lg"></div>
                <div className='mt-8 mb-1 bg-gray-300 h-3 w-[6rem] animate-pulse rounded-lg'></div>
                <div className='mb-4 bg-gray-300 h-6  animate-pulse rounded-lg'></div>
                <div className='mt-4 mb-1 bg-gray-300 h-3 w-[6rem] animate-pulse rounded-lg'></div>
                <div className='mb-4 bg-gray-300 h-6  animate-pulse rounded-lg'></div>
            </div>
            <div className="md:ml-4 md:pl-4 max-w-full w-[23rem] md:w-[23rem] md:max-h-[19rem] md:overflow-y-auto">
                <div className="mb-4">
                    <div className='mb-1 bg-gray-300 h-3 w-[8rem] animate-pulse rounded-lg'></div>
                    <div className="h-9 bg-gray-300 rounded-lg"></div>
                </div>
                <div className="mb-4">
                    <div className='mb-1 bg-gray-300 h-3 w-[8rem] animate-pulse rounded-lg'></div>
                    <div className="h-9 bg-gray-300 rounded-lg"></div>
                </div>
                <div className="mb-4">
                    <div className='mb-1 bg-gray-300 h-3 w-[8rem] animate-pulse rounded-lg'></div>
                    <div className="h-9 bg-gray-300 rounded-lg"></div>
                </div>
                <div className="space-x-2 flex mb-4">
                    <div className="w-full mb-4">
                        <div className='mb-1 bg-gray-300 h-3 w-[8rem] animate-pulse rounded-lg'></div>
                        <div className="h-9 bg-gray-300 rounded-lg"></div>
                    </div>
                    <div className="w-full mb-4">
                        <div className='mb-1 bg-gray-300 h-3 w-[8rem] animate-pulse rounded-lg'></div>
                        <div className="h-9 bg-gray-300 rounded-lg"></div>
                    </div>
                </div>
                <div className="mb-4">
                    <div className='mb-1 bg-gray-300 h-3 w-[8rem] animate-pulse rounded-lg'></div>
                    <div className="h-9 bg-gray-300 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

export default FormSkeleton;
