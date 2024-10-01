import React, { useState } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../../utils/axiosUtils';
import toast from 'react-hot-toast';
import { downloadImage } from '../../../../../utils/imageUtils';

function AddAuthorsForm({ onClose }) {
  const [authorImageURL, setAuthorImageURL] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (url) => {
    setAuthorImageURL(url);
  };

  const handleImageUpload = (file) => {
    setSelectedImageFile(file); // Track the uploaded file
  };

  const handleSubmit = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    const formData = new FormData(event.target);

    // Extract last name from the full name
    const fullName = formData.get('authorName') || '';
    const nameParts = fullName.trim().split(' ');
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

    if (selectedImageFile) {
      formData.append('authorImage', selectedImageFile); // Add the uploaded image file to form data
    } else if (authorImageURL) {
      const file = await downloadImage(authorImageURL, lastName);
      if (file) {
        // console.log('Image file downloaded:', file);
        formData.append('authorImage', file);
      } else {
        setIsLoading(false);
        return console.error('Image file not available');
      }
    }

    // Debug output
    for (let [key, value] of formData.entries()) {
      // console.log(`${key}:`, value);
    }

    // console.log('Form data:', formData);

    try {
      const response = await axiosUtils('/api/addAuthor', 'POST', formData, {
        'Content-Type': 'multipart/form-data',
      });

      if (response.status !== 201) throw new Error('Failed to submit form');
      // console.log('Form submitted successfully');
      // console.log(response);

      setIsLoading(false);
      if (onClose) {
        onClose(); // Call the onClose function to close the modal
      }
      toast.success(response.data.message);

    } catch (error) {
      setIsLoading(false);
      console.error('Error submitting form:', error.response ? error.response.data : error.message);
      toast.error('Error adding the author');
    }
  };


  return (
    <div className=''>
      <h2 className="text-lg font-semibold">Add Author</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
        <ImagePreview onImageChange={handleImageChange} onImageUpload={handleImageUpload} />
        <div className="md:ml-4 md:px-4 md:max-w-[23rem] md:max-h-[19rem] md:overflow-y-auto">
          <div className="mb-2">
            <label className="block text-sm font-medium">Author name:</label>
            <input
              type="text"
              name="authorName"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
              required
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Author nickname: (optional)</label>
            <input
              type="text"
              name="nickname"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
            />
          </div>
          {/* Other form fields */}
          <div className="w-full mb-2 flex space-x-2">
            <div className='w-full'>
              <label className="block text-sm font-medium">Date of birth:</label>
              <input type="date" name="dob" className="w-full border border-gray-300 rounded-lg px-2 py-1" />
            </div>
            <div className='w-full'>
              <label className="block text-sm font-medium">Date of death:</label>
              <input type="date" name="dod" className="w-full border border-gray-300 rounded-lg px-2 py-1" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Custom date of birth:</label>
            <input
              type="text"
              name="customDob"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Nationality:</label>
            <input
              type="text"
              name="nationality"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
            />
          </div>
          <div className="mb-2 flex space-x-2">
            <div className='w-full'>
              <label className="block text-sm font-medium">Biography:</label>
              <textarea name="biography" className="w-full border border-gray-300 rounded-lg px-2 py-1" />
            </div>
            <div className='w-full'>
              <label className="block text-sm font-medium">Awards:</label>
              <textarea name="awards" className="w-full border border-gray-300 rounded-lg px-2 py-1" />
            </div>
          </div>
          <div className="mb-2 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">X:</label>
              <input type="text" name="x" className="w-full border border-gray-300 rounded-lg px-2 py-1" onClick={(e) => e.target.select()} />
            </div>
            <div>
              <label className="block text-sm font-medium">Instagram:</label>
              <input type="text" name="instagram" className="w-full border border-gray-300 rounded-lg px-2 py-1" onClick={(e) => e.target.select()} />
            </div>
            <div>
              <label className="block text-sm font-medium">Facebook:</label>
              <input type="text" name="facebook" className="w-full border border-gray-300 rounded-lg px-2 py-1" onClick={(e) => e.target.select()} />
            </div>
          </div>
          <div className="mb-4 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">Website:</label>
              <input type="text" name="website" onClick={(e) => e.target.select()} className="w-full border border-gray-300 rounded-lg px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Genres:</label>
              <input type="text" name="genres" className="w-full border border-gray-300 rounded-lg px-2 py-1" />
            </div>
          </div>
          <button
            type="submit"
            className={`bg-green-700 flex items-center space-x-2 text-white text-sm font-semibold font-poppins px-4 py-2 rounded-lg on-click-amzn ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className='white-loader'></span>
                <span>Adding...</span>
              </>
            ) :
              'Add Author'
            }
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAuthorsForm;
