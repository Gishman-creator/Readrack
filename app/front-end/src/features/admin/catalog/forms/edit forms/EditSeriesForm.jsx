import React, { useState, useEffect } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../../utils/axiosUtils';
import { bufferToBlobURL, downloadImage } from '../../../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

function EditSeriesForm({ onClose }) {
  const initialSeriesId = useSelector((state) => state.catalog.selectedRowIds[0]); // Assuming only one series is selected
  const serieId = useSelector((state) => state.catalog.serieId);
  const [seriesId, setSeriesId] = useState(serieId || initialSeriesId);
  const [seriesData, setSeriesData] = useState({});
  const [seriesImageURL, setSeriesImageURL] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');
  const [authorOptions, setAuthorOptions] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        const response = await axiosUtils(`/api/getSerieById/${seriesId}`, 'GET');
        const data = response.data;
        setSeriesData(data);
        
        if (data.image && data.image.data) {
          setSeriesImageURL(bufferToBlobURL(data.image));
        } else {
          setSeriesImageURL(data.imageURL || '');
        }

        setSelectedAuthor(data.author_id || '');
        setAuthorSearch(data.author_name || '');
      } catch (error) {
        console.error('Error fetching series data:', error);
      }
    };

    fetchSeriesData();
  }, [seriesId]);

  useEffect(() => {
    if (authorSearch) {
      const fetchAuthors = async () => {
        try {
          const response = await axiosUtils(`/api/search?query=${authorSearch}&type=author`, 'GET');
          setAuthorOptions(response.data.results.map(author => ({
            id: author.id,
            authorName: author.nickname || author.name
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
    setSelectedAuthor(author.id);
    setAuthorSearch(author.authorName);
    setAuthorOptions([]);
  };

  const handleImageChange = (url) => {
    setSeriesImageURL(url);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    if (seriesImageURL && seriesImageURL !== seriesData.imageURL) {
      const file = await downloadImage(seriesImageURL, formData.get('serieName') || '');
      if (file) {
        formData.append('seriesImage', file);
      } else {
        console.error('Image file not available');
      }
    }

    formData.append('author_id', selectedAuthor);

    try {
      const response = await axiosUtils(`/api/updateSerie/${seriesId}`, 'PUT', formData, {
        'Content-Type': 'multipart/form-data',
      });
      if (response.status !== 200) throw new Error('Failed to update series');
      if (onClose) onClose();
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error updating series:', error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">Edit Series</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
        <ImagePreview imageURL={seriesImageURL} onImageChange={handleImageChange} />
        <div className="md:ml-4 md:px-4 md:max-w-[23rem] md:max-h-[15rem] md:overflow-y-auto">
          <div className="mb-2">
            <label className="block text-sm font-medium">Series Name:</label>
            <input
              type="text"
              name="serieName"
              defaultValue={seriesData.serieName || ''}
              className="w-full border border-gray-300 rounded px-2 py-1 focus:border-green-700 focus:ring-green-700"
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
                    {author.authorName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-2 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">Number of Books:</label>
              <input
                type="number"
                name="numBooks"
                defaultValue={seriesData.numBooks || ''}
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Genres:</label>
              <input
                type="text"
                name="genres"
                defaultValue={seriesData.genres || ''}
                className="w-full border border-gray-300 rounded px-2 py-1"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Series Link:</label>
            <input
              type="text"
              name="link"
              defaultValue={seriesData.link || ''}
              className="w-full border border-gray-300 rounded px-2 py-1 focus:border-green-700 focus:ring-green-700"
            />
          </div>
          <button
            type="submit"
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditSeriesForm;
