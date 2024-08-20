import React, { useState } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../../utils/axiosUtils';

function AddAuthorsForm({ onClose }) {
  const [authorImageURL, setAuthorImageURL] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (url) => {
    setAuthorImageURL(url);
  };

  const downloadImage = async (url, lastName) => {
    try {
      console.log('Fetching image from URL:', url);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image. Status: ${response.status}`);
      const blob = await response.blob();
      console.log('Blob received:', blob);
      if (!blob || blob.size === 0) throw new Error('Empty blob received');
      const fileName = lastName ? `${lastName}.jpg` : 'author-image.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      console.log('File created:', file);
      return file; // Return the created file
    } catch (error) {
      console.error('Error downloading image:', error);
      return null; // Return null in case of an error
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    // Extract last name from the full name
    const fullName = formData.get('authorName') || '';
    const nameParts = fullName.trim().split(' ');
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

    if (authorImageURL) {
      const file = await downloadImage(authorImageURL, lastName);
      if (file) {
        formData.append('authorImage', file);
      } else {
        console.error('Image file not available');
      }
    } else {
      console.error('No image URL provided');
    }

    // Debug output
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await axiosUtils('/api/addAuthor', 'POST', formData);

      if (response.status !== 201) throw new Error('Failed to submit form');
      console.log('Form submitted successfully');
      console.log(response);

      if (onClose) {
        onClose(); // Call the onClose function to close the modal
      }
      
      window.location.reload();

    } catch (error) {
      console.error('Error submitting form:', error.response ? error.response.data : error.message);
      // Optionally, you might want to show an error message to the user
      if (onClose) {
        onClose(); // Call the onClose function to close the modal
      }
    }
  };


  return (
    <div className=''>
      <h2 className="text-lg font-semibold">Add Author</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
        <ImagePreview onImageChange={handleImageChange} />
        <div className="md:ml-4 md:px-4 md:max-w-[23rem] md:max-h-[15rem] md:overflow-y-auto">
          <div className="mb-2">
            <label className="block text-sm font-medium">Author name:</label>
            <input
              type="text"
              name="authorName"
              className="w-full border border-gray-300 rounded px-2 py-1 focus:border-[#37643B] focus:ring-[#37643B]"
              required
            />
          </div>
          {/* Other form fields */}
          <div className="mb-2 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">Number of series:</label>
              <input type="number" name="numSeries" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Number of books:</label>
              <input type="number" name="numBooks" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
          </div>
          <div className="mb-2 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">Date of birth:</label>
              <input type="date" name="dob" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Nationality:</label>
              <input type="text" name="nationality" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
          </div>
          <div className="mb-2 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">Biography:</label>
              <textarea name="biography" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Awards:</label>
              <textarea name="awards" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
          </div>
          <div className="mb-2 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">X:</label>
              <input type="text" name="x" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Instagram:</label>
              <input type="text" name="instagram" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Facebook:</label>
              <input type="text" name="facebook" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
          </div>
          <div className="mb-4 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">Website:</label>
              <input type="text" name="website" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Genres:</label>
              <input type="text" name="genres" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#37643B] text-white px-4 py-2 rounded hover:bg-[#2a4c2c]"
          >
            Save Author
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAuthorsForm;
