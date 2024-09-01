import React, { useState, useEffect } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../../utils/axiosUtils';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { downloadImage } from '../../../../../utils/imageUtils';

function AddBooksForm({ onClose }) {
  const [authorImageURL, setAuthorImageURL] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const detailsSerieName = useSelector((state) => state.catalog.serieName);
  const serieDetailsAuthorName = useSelector((state) => state.catalog.authorName);
  const [authorSearch, setAuthorSearch] = useState(serieDetailsAuthorName || '');
  const [serieSearch, setSerieSearch] = useState(detailsSerieName || '');
  const [authorOptions, setAuthorOptions] = useState([]);
  const [serieOptions, setSerieOptions] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(serieDetailsAuthorName || '');
  const [selectedSerie, setSelectedSerie] = useState(detailsSerieName || '');

  useEffect(() => {
    if (authorSearch) {
      const fetchAuthors = async () => {
        try {
          const response = await axiosUtils(`/api/search?query=${authorSearch}&type=author`, 'GET');
          setAuthorOptions(response.data.results.map(author => ({
            id: author.id,
            authorName: author.nickname ? author.nickname : author.name
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

  useEffect(() => {
    if (serieSearch) {
      const fetchSeries = async () => {
        try {
          const response = await axiosUtils(`/api/search?query=${serieSearch}&type=series`, 'GET');
          setSerieOptions(response.data.results.map(serie => ({
            id: serie.id,
            serieName: serie.serieName
          })));
        } catch (error) {
          console.error('Error fetching series:', error);
        }
      };
      fetchSeries();
    } else {
      setSerieOptions([]);
    }
  }, [serieSearch]);

  const handleAuthorChange = (e) => {
    setAuthorSearch(e.target.value);
  };

  const handleSerieChange = (e) => {
    setSerieSearch(e.target.value);
  };

  const handleAuthorSelect = (author) => {
    setSelectedAuthor(author.id);
    setAuthorSearch(author.authorName);
    setAuthorOptions([]);
  };

  const handleSerieSelect = (serie) => {
    setSelectedSerie(serie.id);
    setSerieSearch(serie.serieName);
    setSerieOptions([]);
  };

  const handleImageChange = (url) => {
    setAuthorImageURL(url);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const bookName = formData.get('bookName') || '';

    if (authorImageURL) {
      const file = await downloadImage(authorImageURL, bookName);
      if (file) {
        formData.append('bookImage', file); // Append the file directly
      } else {
        console.error('Image file not available');
      }
    } else {
      console.error('No image URL provided');
    }

    formData.append('author_id', selectedAuthor);
    formData.append('serie_id', selectedSerie);

    try {
      const response = await axiosUtils('/api/addBook', 'POST', formData, {
        'Content-Type': 'multipart/form-data',
      });

      if (response.status !== 201) throw new Error('Failed to submit form');
      // console.log('Form submitted successfully');
      // console.log(response);

      if (onClose) {
        onClose(); // Call the onClose function to close the modal
      }
      toast.success(response.data.message);

    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className=''>
      <h2 className="text-lg font-semibold">Add Book</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
        <ImagePreview onImageChange={handleImageChange} />
        <div className="md:ml-4 md:px-4 md:max-w-[23rem] md:max-h-[15rem] md:overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium">Book name:</label>
            <input
              type="text"
              name="bookName"
              className="w-full border border-gray-300 rounded px-2 py-1 focus:border-green-700 focus:ring-green-700"
              required
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium">Author name:</label>
            <input
              type="text"
              value={authorSearch}
              onChange={handleAuthorChange}
              className="w-full border border-gray-300 rounded px-2 py-1"
              placeholder="Search author..."
            />
            {authorOptions.length > 0 && (
              <ul className="border border-gray-300 rounded max-h-60 overflow-auto bg-white absolute w-full top-14 z-10">
                {authorOptions.map((author) => (
                  <li
                    key={author.id}
                    onClick={() => handleAuthorSelect(author)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    {author.authorName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium">Serie name:</label>
            <input
              type="text"
              value={serieSearch}
              onChange={handleSerieChange}
              className="w-full border border-gray-300 rounded px-2 py-1"
              placeholder="Search series..."
            />
            {serieOptions.length > 0 && (
              <ul className="border border-gray-300 rounded mt-2 max-h-60 overflow-auto bg-white absolute w-full top-14 z-10">
                {serieOptions.map((serie) => (
                  <li
                    key={serie.id}
                    onClick={() => handleSerieSelect(serie)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    {serie.serieName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-2 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">Publish date:</label>
              <input type="date" name="publishDate" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Genres:</label>
              <input type="text" name="genres" className="w-full border border-gray-300 rounded px-2 py-1" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Amazon link:</label>
            <input
              type="text"
              name="link"
              className="w-full border border-gray-300 rounded px-2 py-1 focus:border-green-700 focus:ring-green-700"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-700 text-white px-4 py-2 rounded on-click-amzn"
          >
            Save Book
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddBooksForm;
