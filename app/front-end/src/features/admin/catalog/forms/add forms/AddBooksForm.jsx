import React, { useState, useEffect } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../../utils/axiosUtils';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { downloadImage } from '../../../../../utils/imageUtils';
import { setAuthor, setSerie, setSerieBookCount } from '../../../slices/catalogSlice';

function AddBooksForm({ onClose }) {
  const [bookImageURL, setBookImageURL] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const detailsSerie = useSelector((state) => state.catalog.serie);
  const serieDetailsAuthor = useSelector((state) => state.catalog.author);
  const detailsAuthors = useSelector((state) => state.catalog.authors);
  const serieBookCount = useSelector((state) => state.catalog.serieBookCount);
  // console.log('The serie book count:', serieBookCount + 1);

  // Safely access properties of serieDetailsAuthor
  const detailsAuthor = serieDetailsAuthor
    ? {
      author_id: serieDetailsAuthor.author_id || serieDetailsAuthor.id,
      author_name: serieDetailsAuthor.author_name
    }
    : {}; // Fallback to an empty object if serieDetailsAuthor is null or undefined

  // console.log(detailsAuthors)
  const [authorSearch, setAuthorSearch] = useState('');
  const [serieSearch, setSerieSearch] = useState(detailsSerie ? detailsSerie.serie_name : '');
  const [authorOptions, setAuthorOptions] = useState([]);
  const [serieOptions, setSerieOptions] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState(serieDetailsAuthor ? [detailsAuthor] : (detailsAuthors || []));
  const [selectedSerie, setSelectedSerie] = useState(detailsSerie ? { id: detailsSerie.id, serie_name: detailsSerie.serie_name } : '');
  const [isLoading, setIsLoading] = useState(false);
  const [authorIsLoading, setAuthorIsLoading] = useState(false);
  const [serieIsLoading, setSerieIsLoading] = useState(false);

  const dispatch = useDispatch();
  const [book_name, setBookName] = useState();
  const [bookNameCount, setBookNameCount] = useState(0);

  useEffect(() => {
    const fetchBookNames = async () => {
      if (!book_name.trim()) return;
      try {
        const response = await axiosUtils(`/api/getBookNames?book_name=${book_name}`, 'GET');
        // console.log('The book names response is:', response);
        setBookNameCount(response.data.bookNameCount);
        // console.log('The book name count is:', response.data.bookNameCount)
      } catch (error) {
        console.error('Error fetching book names:', error);
      }
    }

    fetchBookNames();
  }, [book_name])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // console.log('Selected authors:', selectedAuthors);
      if (authorSearch && !selectedAuthors.some(author => author.author_name === authorSearch)) {
        const fetchAuthors = async () => {
          setAuthorIsLoading(true);
          try {
            const response = await axiosUtils(`/api/search?query=${authorSearch}&type=author`, 'GET');
            setAuthorOptions(response.data.results.map(author => ({
              author_id: author.id,
              author_name: author.author_name
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (selectedSerie && serieSearch === selectedSerie.serie_name) return;
      setSelectedSerie('');
      if (serieSearch && !selectedSerie) {
        const fetchSeries = async () => {
          setSerieIsLoading(true);
          try {
            const response = await axiosUtils(`/api/search?query=${serieSearch}&type=series`, 'GET');
            setSerieOptions(response.data.results.map(serie => ({
              id: serie.id,
              serie_name: serie.serie_name
            })));
            setSerieIsLoading(false);
          } catch (error) {
            console.error('Error fetching series:', error);
          }
        };
        fetchSeries();
      } else {
        setSerieOptions([]);
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(delayDebounceFn); // Clear timeout if authorSearch changes
    };

  }, [serieSearch]);

  const handleAuthorChange = (e) => {
    setAuthorSearch(e.target.value);
  };

  const handleAuthorSelect = (author) => {
    if (!selectedAuthors.some(a => a.author_id === author.author_id)) {
      setSelectedAuthors([...selectedAuthors, author]);
    }
    setAuthorSearch('');
    setAuthorOptions([]);
  };

  const handleAuthorRemove = (index) => {
    setSelectedAuthors(selectedAuthors.filter((_, i) => i !== index));
  };

  const handleSerieChange = (e) => {
    setSerieSearch(e.target.value);
  };

  const handleSerieSelect = (serie) => {
    setSelectedSerie(serie);
    setSerieSearch(serie.serie_name);
    setSerieOptions([]);
  };

  const handleImageChange = (url) => {
    setBookImageURL(url);
  };

  const handleImageUpload = (file) => {
    setSelectedImageFile(file); // Track the uploaded file
  };

  const handleSubmit = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    const formData = new FormData(event.target);

    const book_name = formData.get('book_name') || '';

    if (selectedImageFile) {
      formData.append('bookImage', selectedImageFile); // Add the uploaded image file to form data
    } else if (bookImageURL) {
      const file = await downloadImage(bookImageURL, book_name);
      if (file) {
        formData.append('bookImage', file);
      } else {
        setIsLoading(false);
        return console.error('Image file not available');
      }
    }

    formData.append('author_id', selectedAuthors.map((author) => author.author_id).join(', '));
    // console.log('The selected authors ids:', formData.author_id);
    formData.append('serie_id', selectedSerie.id);

    try {
      const response = await axiosUtils('/api/addBook', 'POST', formData, {
        'Content-Type': 'multipart/form-data',
      });

      if (response.status !== 201) throw new Error('Failed to submit form');

      setIsLoading(false);
      dispatch(setAuthor(''));
      dispatch(setSerie(''));
      setAuthorSearch('');
      setSerieSearch('');
      setSelectedAuthors('');
      setSelectedSerie('');
      if (onClose) {
        onClose(); // Call the onClose function to close the modal
      }
      toast.success(response.data.message);

    } catch (error) {
      setIsLoading(false);
      console.error('Error submitting form:', error);
      toast.error('Error adding the book');
    }
  };

  return (
    <div className=''>
      <h2 className="text-lg font-semibold">Add Book</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
        <ImagePreview onImageChange={handleImageChange} onImageUpload={handleImageUpload} />
        <div className="md:ml-4 md:px-4 md:min-w-[23rem] md:max-h-[19rem] md:overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium">Book name:</label>
            <input
              type="text"
              name="book_name"
              value={book_name}
              onChange={(e) => setBookName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
              required
            />
            <p className={`${bookNameCount > 0 && book_name.trim() ? 'block' : 'hidden'} text-red-800 mt-1 text-xs font-semibold`}>Book named "{book_name}" already exists.</p>
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium">Author name:</label>
            <div className='flex items-center border border-gray-300 rounded-lg'>
              <input
                type="text"
                value={authorSearch}
                onChange={handleAuthorChange}
                className="w-full border-none outline-none px-2 py-1"
                placeholder="Search author..."
              />
              {authorIsLoading && (
                <span className='px-2 mx-2 w-6 h-full green-loader'></span>
              )}
            </div>
            {authorOptions.length > 0 ? (
              <ul className="border border-gray-300 rounded-lg max-h-60 overflow-auto bg-white absolute w-full top-14 z-10">
                {authorOptions.map((author) => (
                  <li
                    key={author.author_id}
                    onClick={() => handleAuthorSelect(author)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    {author.author_name}
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
                  <span>{author.author_name}</span>
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
          <div className="mb-4 relative">
            <label className="block text-sm font-medium">Serie name:</label>
            <div className='flex items-center border border-gray-300 rounded-lg'>
              <input
                type="text"
                value={serieSearch}
                onChange={handleSerieChange}
                className="w-full border-none outline-none px-2 py-1"
                placeholder="Search series..."
              />
              {serieIsLoading && (
                <span className='px-2 mx-2 w-6 h-full green-loader'></span>
              )}
            </div>
            {serieOptions.length > 0 ? (
              <ul className="border border-gray-300 rounded-lg mt-2 max-h-60 overflow-auto bg-white absolute w-full top-14 z-10">
                {serieOptions.map((serie) => (
                  <li
                    key={serie.id}
                    onClick={() => handleSerieSelect(serie)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    {serie.serie_name}
                  </li>
                ))}
              </ul>
            ) : serieSearch && !serieIsLoading && !selectedSerie && (
              <ul className="border border-gray-300 rounded-lg max-h-60 overflow-auto bg-white absolute w-full top-14 z-10">
                <li
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  No series found
                </li>
              </ul>
            )}
          </div>
          {selectedSerie && (
            <div className="mb-4">
              <label htmlFor="serie_index" className="block text-sm font-medium">Serie Index:</label>
              <input
                type="text"
                id="serie_index"
                name="serie_index"
                defaultValue={serieBookCount + 1} // Prefill with calculated value
                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium">Publish date:</label>
            <input
              type="text"
              name="publish_date"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
              placeholder="e.g., October 8, 2024"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Genres:</label>
            <input
              type="text"
              name="genre"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Amazon link:</label>
            <input
              type="text"
              name="amazon_link"
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
              onClick={(e) => e.target.select()}
              required
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
              'Add Book'
            }
          </button>
        </div>
      </form >
    </div >
  );
}

export default AddBooksForm;
