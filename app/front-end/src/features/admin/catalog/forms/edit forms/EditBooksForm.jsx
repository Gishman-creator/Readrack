import React, { useState, useEffect } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../../utils/axiosUtils';
import { bufferToBlobURL, downloadImage } from '../../../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

function EditBooksForm({ onClose }) {
  const selectedRowBookId = useSelector((state) => state.catalog.selectedRowIds[0]);
  const serieBookId = useSelector((state) => state.catalog.bookId);
  const [bookId, setBookId] = useState(serieBookId || selectedRowBookId);
  const [bookDetails, setBookDetails] = useState({});
  const [bookImageURL, setBookImageURL] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [authorSearch, setAuthorSearch] = useState('');
  const [serieSearch, setSerieSearch] = useState('');
  const [collectionSearch, setCollectionSearch] = useState('');
  const [authorOptions, setAuthorOptions] = useState([]);
  const [serieOptions, setSerieOptions] = useState([]);
  const [collectionOptions, setCollectionOptions] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    // console.log('Book ID:', bookId); // Check if bookId is correct

    if (bookId) {
      const fetchBookDetails = async () => {
        try {
          const response = await axiosUtils(`/api/getBookById/${bookId}`, 'GET');
          setBookDetails(response.data);
          // console.log('Book Details:', response.data);

          if (response.data.image) {
            setBookImageURL(response.data.imageURL);
          } else {
            setBookImageURL(response.data.imageURL || '');
          }

          setBookId(response.data.id);
          setSelectedAuthor(response.data.author_id || '');
          setAuthorSearch(response.data.author_name || '');
          setSelectedSerie(response.data.serie_id || '');
          setSerieSearch(response.data.serie_name || '');
          setSelectedCollection(response.data.collection_id || '');
          setCollectionSearch(response.data.collection_name || '');
        } catch (error) {
          console.error('Error fetching book details:', error);
        }
      };

      fetchBookDetails();
    }
  }, [bookId]);

  useEffect(() => {
    if (authorSearch) {
      const fetchAuthors = async () => {
        try {
          const response = await axiosUtils(`/api/search?query=${authorSearch}&type=author`, 'GET');
          setAuthorOptions(response.data.results.map(author => ({
            id: author.id,
            authorName: author.nickname ? author.nickname : author.authorName
          })));
          // console.log(authorOptions);
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

  useEffect(() => {
    if (collectionSearch) {
      const fetchCollections = async () => {
        try {
          const response = await axiosUtils(`/api/search?query=${collectionSearch}&type=collections`, 'GET');
          setCollectionOptions(response.data.results.map(collection => ({
            id: collection.id,
            collectionName: collection.collectionName
          })));
        } catch (error) {
          console.error('Error fetching collections:', error);
        }
      };
      fetchCollections();
    } else {
      setCollectionOptions([]);
    }
  }, [collectionSearch]);

  const handleAuthorChange = (e) => {
    setAuthorSearch(e.target.value);
    if (!e.target.value) {
      setSelectedAuthor(e.target.value)
    }
  };

  const handleSerieChange = (e) => {
    setSerieSearch(e.target.value);
  };

  const handleCollectionChange = (e) => {
    setCollectionSearch(e.target.value);
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

  const handleCollectionSelect = (collection) => {
    setSelectedCollection(collection.id);
    setCollectionSearch(collection.collectionName);
    setCollectionOptions([]);
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

    if (!bookId) {
      console.error('No book ID available for update');
      return;
    }

    const formData = new FormData(event.target);

    // Log form data entries
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const bookName = formData.get('bookName') || '';
    let imageName = bookDetails.image;

    if (selectedImageFile) {
      formData.append('bookImage', selectedImageFile); // Add the uploaded image file to form data
    } else if (bookImageURL && bookImageURL !== bookDetails.imageURL) {
      const file = await downloadImage(bookImageURL, bookName);
      if (file) {
        formData.append('bookImage', file);
      } else {
        return console.error('Image file not available');
      }
    } else if (!bookImageURL) {
      imageName = null;
    }

    formData.append('imageName', imageName);

    formData.append('author_id', selectedAuthor);
    formData.append('serie_id', selectedSerie);
    formData.append('collection_id', selectedCollection);

    // Log form data entries
    for (let [key, value] of formData.entries()) {
      // console.log(`${key}: ${value}`);
    }

    try {
      const response = await axiosUtils(`/api/updateBook/${bookId}`, 'PUT', formData, {
        'Content-Type': 'multipart/form-data',
      });

      if (response.status !== 200) throw new Error('Failed to update book');
      // console.log('Book updated successfully');
      // console.log(response);

      setIsLoading(false);
      if (onClose) {
        onClose(); // Call the onClose function to close the modal
      }
      toast.success(response.data.message);

    } catch (error) {
      setIsLoading(false);
      console.error('Error updating book:', error);
      toast.error('Error updating the book');
    }
  };

  return (
    <div className=''>
      <h2 className="text-lg font-semibold">Edit Book</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
        <ImagePreview
          onImageChange={handleImageChange}
          imageURL={bookImageURL} // Pass existing image URL to the ImagePreview component
          onImageUpload={handleImageUpload}
        />
        <div className="md:ml-4 md:px-4 md:max-w-[23rem] md:max-h-[19rem] md:overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium">Book name:</label>
            <input
              type="text"
              name="bookName"
              defaultValue={bookDetails.bookName || ''}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
              required
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-medium">Author name:</label>
            <input
              type="text"
              value={authorSearch}
              onChange={handleAuthorChange}
              className="w-full border border-gray-300 rounded-lg px-2 py-1"
              placeholder="Search author..."
            />
            {authorOptions.length > 0 && (
              <ul className="border border-gray-300 rounded-lg max-h-60 overflow-auto bg-white absolute w-full top-14 z-10">
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
              className="w-full border border-gray-300 rounded-lg px-2 py-1"
              placeholder="Search series..."
            />
            {serieOptions.length > 0 && (
              <ul className="border border-gray-300 rounded-lg mt-2 max-h-60 overflow-auto bg-white absolute w-full top-12 z-10">
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
          <div className="mb-4 relative">
            <label className="block text-sm font-medium">Collection name:</label>
            <input
              type="text"
              value={collectionSearch}
              onChange={handleCollectionChange}
              className="w-full border border-gray-300 rounded-lg px-2 py-1"
              placeholder="Search collections..."
            />
            {collectionOptions.length > 0 && (
              <ul className="border border-gray-300 rounded-lg mt-2 max-h-60 overflow-auto bg-white absolute w-full top-12 z-10">
                {collectionOptions.map((collection) => (
                  <li
                    key={collection.id}
                    onClick={() => handleCollectionSelect(collection)}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    {collection.collectionName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-2 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">Publish date:</label>
              <input
                type="date"
                name="publishDate"
                defaultValue={bookDetails.publishDate?.split('T')[0] || ''}
                className="w-full border border-gray-300 rounded-lg px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Genres:</label>
              <input
                type="text"
                name="genres"
                defaultValue={bookDetails.genres || ''}
                className="w-full border border-gray-300 rounded-lg px-2 py-1"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Amazon link:</label>
            <input
              type="text"
              name="link"
              defaultValue={bookDetails.link || ''}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
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
                <span>Saving...</span>
              </>
            ) :
              'Save Changes'
            }
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditBooksForm;
