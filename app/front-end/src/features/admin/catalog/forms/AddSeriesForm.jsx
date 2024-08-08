import React, { useState, useEffect } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../utils/axiosUtils';

function AddSeriesForm({ onClose }) {
  const [seriesImageURL, setSeriesImageURL] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [authorSearch, setAuthorSearch] = useState('');
  const [authorOptions, setAuthorOptions] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');

  useEffect(() => {
    if (authorSearch) {
      const fetchAuthors = async () => {
        try {
          const response = await axiosUtils(`/api/searchAuthors?search=${authorSearch}`, 'GET');
          setAuthorOptions(response.data.map(author => ({
            id: author.id,
            name: author.name
          })));
        } catch (error) {
          console.error('Error fetching authors:', error);
        }
      };
      fetchAuthors();
    } else {
      setAuthorOptions([]);
    }
  }, [authorSearch]);

  const handleAuthorChange = (e) => {
    setAuthorSearch(e.target.value);
  };

  const handleAuthorSelect = (author) => {
    setSelectedAuthor(author.name);
    setAuthorSearch(author.name); // Set the selected author in the input
    setAuthorOptions([]);
  };

  const handleImageChange = (url) => {
    setSeriesImageURL(url);
  };

  const downloadImage = async (url, seriesName) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch image. Status: ${response.status}`);
      const blob = await response.blob();
      if (!blob || blob.size === 0) throw new Error('Empty blob received');
      const fileName = seriesName ? `${seriesName}.jpg` : 'series-image.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      return file; // Return the created file
    } catch (error) {
      console.error('Error downloading image:', error);
      return null; // Return null in case of an error
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const seriesName = formData.get('serieName') || '';

    if (seriesImageURL) {
      const file = await downloadImage(seriesImageURL, seriesName);
      if (file) {
        formData.append('seriesImage', file); // Append the file directly
      } else {
        console.error('Image file not available');
      }
    } else {
      console.error('No image URL provided');
    }

    formData.append('authorName', selectedAuthor);

    // Debug output
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Process form data (e.g., send to server)
    try {
      const response = await axiosUtils('/api/addSeries', 'POST', formData, {
        'Content-Type': 'multipart/form-data',
      });

      if (response.status !== 201) throw new Error('Failed to submit form');
      console.log('Form submitted successfully');
      console.log(response);

      if (onClose) {
        onClose(); // Call the onClose function to close the modal
      }

    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className=''>
      <h2 className="text-lg font-semibold">Add Series</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
        <ImagePreview onImageChange={handleImageChange} />
        <div className="md:ml-4 md:px-4 md:max-w-[23rem] md:max-h-[15rem] md:overflow-y-auto">
          <div className="mb-2">
            <label className="block text-sm font-medium">Series Name:</label>
            <input
              type="text"
              name="serieName"
              className="w-full border border-gray-300 rounded px-2 py-1 focus:border-[#37643B] focus:ring-[#37643B]"
              required
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium">Author Name:</label>
            <input
              type="text"
              value={authorSearch}
              onChange={handleAuthorChange}
              className="w-full border border-gray-300 rounded px-2 py-1"
              placeholder="Search author..."
            />
            {authorOptions.length > 0 && (
              <ul className="border border-gray-300 rounded mt-2 max-h-60 overflow-auto bg-white absolute w-full z-10">
                {authorOptions.map((author) => (
                  <li
                    key={author.id}
                    onClick={() => handleAuthorSelect(author)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    {author.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-2 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">Number of Books:</label>
              <input type="number" name="numBooks" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Genres:</label>
              <input type="text" name="genres" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Series Link:</label>
            <input
              type="text"
              name="link"
              className="w-full border border-gray-300 rounded px-2 py-1 focus:border-[#37643B] focus:ring-[#37643B]"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-[#37643B] text-white px-4 py-2 rounded hover:bg-[#2a4c2c]"
          >
            Save Series
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddSeriesForm;
