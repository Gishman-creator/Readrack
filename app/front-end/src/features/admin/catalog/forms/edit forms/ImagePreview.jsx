import React, { useState, useEffect } from 'react';

function ImagePreview({ imageURL, onImageChange }) {
  const [localImageURL, setLocalImageURL] = useState(imageURL);

  useEffect(() => {
    setLocalImageURL(imageURL);
  }, [imageURL]);

  const handleURLChange = (event) => {
    const url = event.target.value;
    setLocalImageURL(url);
    onImageChange(url); // Notify parent about the URL
  };

  return (
    <div className="mb-4 flex flex-col justify-between md:w-[13rem]">
      <div className="h-[10rem] w-full bg-slate-200 flex justify-center items-center rounded-lg">
        {localImageURL ? (
          <img
            src={localImageURL}
            alt="Preview"
            className="h-full object-cover"
            onError={() => setLocalImageURL('')} // Handle error case if image can't load
          />
        ) : (
          'Preview'
        )}
      </div>
      <div className="mt-6">
        <label className="block text-sm font-medium">Image Link:</label>
        <input
          type="text"
          placeholder="Enter image link"
          value={localImageURL}
          onChange={handleURLChange}
          className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-[#37643B] focus:ring-[#37643B]"
        />
      </div>
    </div>
  );
}

export default ImagePreview;
