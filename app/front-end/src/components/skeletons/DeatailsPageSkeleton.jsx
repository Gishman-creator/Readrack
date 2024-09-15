import React from 'react';
import { useSelector } from 'react-redux';

const DeatailsPageSkeleton = ({ activeTab, admin }) => {

  return (
    <div className={`${admin ? '' : 'px-[4%] sm:px-[12%] py-6'}`}>
      <div className="md:flex md:flex-row md:space-x-6 xl:space-x-8 mb-10">
        {/* Skeleton for author image */}
        <div className="w-full md:w-[22rem] md:h-full md:sticky md:top-20 lg:top-[4.5rem] overflow-auto">
          <div className="w-full max-w-[13rem] mx-auto">
            <div className=" h-[16rem] bg-gray-200 rounded-lg animate-pulse mx-auto"></div>
            <div className="w-full mx-auto mt-4">
              <div className="w-48 h-6 bg-gray-200 rounded-lg animate-pulse mx-auto mb-2"></div>
              <div className="w-32 h-4 bg-gray-200 rounded-lg animate-pulse mx-auto mb-2"></div>
              <div className="w-48 h-4 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4"></div>
              {activeTab === 'Authors' ? (
                <div className="flex justify-evenly items-center mt-10">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse mt-12"></div>
              )}
            </div>
          </div>
        </div>

        {/* Skeleton for author details */}
        <div className="w-full md:mt-2 mb-2">
          <div className="mt-6 md:mt-0">
            {activeTab === 'Authors' && (
              <div className="mb-16">
                <div className="w-64 h-6 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                <div className="w-full h-4 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                <div className="w-full h-4 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                <div className="w-full h-4 bg-gray-200 rounded-lg animate-pulse mb-4"></div>

                {/* Skeleton for series */}
                <div className="mt-8">
                  <div className="w-64 h-6 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, index) => (
                      <div key={index} className="flex space-x-2 mt-4 pb-3 border-b-2 border-slate-300 cursor-default">
                        <div className="w-24 h-full bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="min-h-full w-full flex flex-col justify-between">
                          <div className="w-full h-4 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                          <div className="w-full h-4 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                          <div className="w-full h-4 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
                          <div className="w-full h-8 bg-gray-200 rounded-lg animate-pulse mt-auto"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Skeleton for books */}
            <div>
              <div className="w-64 h-6 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="flex space-x-2 mt-4 pb-3 border-b-2 border-slate-300 cursor-default">
                    <div className="w-24 h-full bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="min-h-full w-full flex flex-col justify-between">
                      <div className="w-full h-4 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                      <div className="w-full h-4 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
                      <div className="w-full h-4 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
                      <div className="w-full h-8 bg-gray-200 rounded-lg animate-pulse mt-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DeatailsPageSkeleton;
