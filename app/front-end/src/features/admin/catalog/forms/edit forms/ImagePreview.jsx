import React, { useState, useEffect } from 'react';
import blank_image from '../../../../../assets/brand_blank_image.png';

function ImagePreview({ imageURL, onImageChange, onImageUpload }) {
  const [localImageURL, setLocalImageURL] = useState(imageURL);

  useEffect(() => {
    setLocalImageURL(imageURL);
  }, [imageURL]);

  const handleURLChange = (event) => {
    const url = event.target.value;
    // console.log('The new image url is:', url);
    setLocalImageURL(url);
    onImageChange(url); // Notify parent about the URL change
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setLocalImageURL(imageUrl);
      onImageUpload(file); // Notify parent about the uploaded file
    }
  };

  return (
    <div className="mb-4 flex flex-col justify-between md:w-[13rem]">
      <div className="h-[10rem] w-full bg-slate-200 flex justify-center items-center rounded-lg">
        {localImageURL ? (
          <img
            src={localImageURL || blank_image}
            alt="Preview"
            className="h-full object-cover"
            onError={() => setLocalImageURL('')} // Handle error if image can't load
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
          onClick={(e) => e.target.select()}
          className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-[#37643B] focus:ring-[#37643B]"
        />
        <label className="block text-sm font-medium mt-2">Upload Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-[#37643B] focus:ring-[#37643B]"
        />
      </div>
    </div>
  );
}

export default ImagePreview;
