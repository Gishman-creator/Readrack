// src/components/ImagePreview.js
import React, { useState } from 'react';

function ImagePreview({ onImageChange }) {
  const [imageURL, setImageURL] = useState('');

  const handleURLChange = (event) => {
    const url = event.target.value;
    setImageURL(url);
    onImageChange(url); // Notify parent about the URL
  };

  return (
    <div className="mb-4 flex flex-col justify-between md:w-[13rem]">
      <div className="h-[10rem] w-full bg-slate-200 flex justify-center items-center rounded-md">
        {imageURL ? (
          <img
            src={imageURL}
            alt="Preview"
            className="h-full object-cover"
            onError={() => setImageURL('')} // Handle error case if image can't load
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
          value={imageURL}
          onChange={handleURLChange}
          className="w-full border border-gray-300 rounded px-2 py-1 focus:border-[#37643B] focus:ring-[#37643B]"
        />
      </div>
    </div>
  );
}

export default ImagePreview;
