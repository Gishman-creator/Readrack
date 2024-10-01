import React, { useState, useEffect } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../../utils/axiosUtils';
import toast from 'react-hot-toast';
import { downloadImage } from '../../../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthor } from '../../../slices/catalogSlice';

function AddSeriesForm({ onClose }) {
  const authorDetailsAuthor = useSelector((state) => state.catalog.author);
  const detailsAuthor = authorDetailsAuthor ? { id: authorDetailsAuthor.id, authorName: authorDetailsAuthor.nickname || authorDetailsAuthor.authorName } : {};
  const [seriesImageURL, setSeriesImageURL] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const [authorSearch, setAuthorSearch] = useState('');
  const [authorOptions, setAuthorOptions] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState(
    detailsAuthor && Object.keys(detailsAuthor).length ? [detailsAuthor] : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [authorIsLoading, setAuthorIsLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    // console.log('The author search is:', authorSearch);
    console.log('The selected authors set to:', selectedAuthors)
  }, [authorSearch, selectedAuthors])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // console.log('Selected authors:', selectedAuthors);
      if (authorSearch && !selectedAuthors.some(author => author.authorName === authorSearch)) {
        const fetchAuthors = async () => {
          setAuthorIsLoading(true);
          try {
            const response = await axiosUtils(`/api/search?query=${authorSearch}&type=author`, 'GET');
            setAuthorOptions(response.data.results.map(author => ({
              id: author.id,
              authorName: author.nickname ? author.nickname : author.authorName
            })));
            setAuthorIsLoading(false);
          } catch (error) {
            console.error('Error fetching authors:', error);
          }
        };
        fetchAuthors();
      } else {
        setAuthorOptions([]);
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(delayDebounceFn); // Clear timeout if authorSearch changes
    };

  }, [authorSearch]);

  const handleAuthorChange = (e) => {
    setAuthorSearch(e.target.value);
  };

  const handleAuthorSelect = (author) => {
    if (!selectedAuthors.some(a => a.id === author.id)) {
      setSelectedAuthors([...selectedAuthors, author]);
    }
    setAuthorSearch('');
    setAuthorOptions([]);
  };

  const handleAuthorRemove = (index) => {
    setSelectedAuthors(selectedAuthors.filter((_, i) => i !== index));
  };


  const handleImageChange = (url) => {
    setSeriesImageURL(url);
  };

  const handleImageUpload = (file) => {
    setSelectedImageFile(file); // Track the uploaded file
  };

  const handleSubmit = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    const formData = new FormData(event.target);

    const seriesName = formData.get('serieName') || '';

    if (selectedImageFile) {
      formData.append('seriesImage', selectedImageFile); // Add the uploaded image file to form data
    } else if (seriesImageURL) {
      const file = await downloadImage(seriesImageURL, seriesName);
      if (file) {
        formData.append('seriesImage', file);
      } else {
        setIsLoading(false);
        return console.error('Image file not available');
      }
    }

    formData.append('author_id', selectedAuthors.map((author) => author.id).join(', '));

    try {
      const response = await axiosUtils('/api/addSeries', 'POST', formData, {
        'Content-Type': 'multipart/form-data',
      });

      if (response.status !== 201) throw new Error('Failed to submit form');
      // console.log('Form submitted successfully');
      // console.log(response);

      setIsLoading(false);
      dispatch(setAuthor(''));
      setAuthorSearch('');
      setSelectedAuthors('');
      if (onClose) {
        onClose(); // Call the onClose function to close the modal
      }
      toast.success(response.data.message);

    } catch (error) {
      setIsLoading(false);
      console.error('Error submitting form:', error);
      toast.error('Error adding the serie');
    }
  };

  return (
    <div className=''>
      <h2 className="text-lg font-semibold">Add Series</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
        <ImagePreview onImageChange={handleImageChange} onImageUpload={handleImageUpload} />
        <div className="md:ml-4 md:px-4 md:max-w-[23rem] md:min-h-[19rem] md:overflow-y-auto">
          <div className="mb-2">
            <label className="block text-sm font-medium">Series Name:</label>
            <input
              type="text"
              name="serieName"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
              required
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium">Author Name:</label>
            <div className='flex items-center border border-gray-300 rounded-lg'>
              <input
                type="text"
                value={authorSearch}
                onChange={handleAuthorChange}
                className="w-full outline-none rounded-lg px-2 py-1"
                placeholder="Search author..."
              />
              {authorIsLoading && (
                <span className='px-2 mx-2 w-6 h-full green-loader'></span>
              )}
            </div>
            {authorOptions.length > 0 ? (
              <ul className="border border-gray-300 rounded-lg mt-2 max-h-60 overflow-auto bg-white absolute w-full z-10">
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
            ) : authorSearch && !authorIsLoading && !selectedAuthors && (
              <ul className="border border-gray-300 rounded-lg max-h-60 overflow-auto bg-white absolute w-full top-14 z-10">
                <li
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  No authors found
                </li>
              </ul>
            )}
          </div>
          {selectedAuthors.length > 0 ? (
            <div className="bg-green-700 rounded-lg my-2 flex flex-wrap gap-2 p-2">
              {selectedAuthors.map((author, index) => (
                <span key={index} className="bg-[rgba(255,255,255,0.3)] flex items-center max-w-fit max-h-fit text-white font-poppins font-semibold px-2 py-1 rounded-lg text-sm space-x-1">
                  <span>{author.authorName}</span>
                  <span
                    className='text-xl cursor-pointer'
                    onClick={() => handleAuthorRemove(index)}
                  >
                    &times;
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <div className="bg-green-700 rounded-lg my-2 flex flex-wrap gap-2 p-2">
              <span className="bg-[rgba(255,255,255,0.3)] flex items-center max-w-fit max-h-fit text-white font-poppins font-semibold px-2 py-1 rounded-lg text-sm space-x-1">
                No authors selected
              </span>
            </div>
          )}
          <div className="mb-2 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">Number of Books:</label>
              <input type="number" name="numBooks" className="w-full border border-gray-300 rounded-lg px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Genres:</label>
              <input type="text" name="genres" className="w-full border border-gray-300 rounded-lg px-2 py-1" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Series Link:</label>
            <input
              type="text"
              name="link"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
              onClick={(e) => e.target.select()}
            />
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
              'Add Serie'
            }
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddSeriesForm;
