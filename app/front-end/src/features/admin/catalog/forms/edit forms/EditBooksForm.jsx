import React, { useState, useEffect } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../../utils/axiosUtils';
import { bufferToBlobURL, downloadImage } from '../../../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import FormSkeleton from '../../../../../components/skeletons/FormSkeleton';

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
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedSerie, setSelectedSerie] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authorIsLoading, setAuthorIsLoading] = useState(false);
  const [serieIsLoading, setSerieIsLoading] = useState(false);
  const [collectionIsLoading, setCollectionIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    // console.log('Book ID:', bookId); // Check if bookId is correct

    if (bookId) {
      const fetchBookDetails = async () => {
        setFetchLoading(true);
        try {
          const response = await axiosUtils(`/api/getBookById/${bookId}`, 'GET');
          setBookDetails(response.data);
          // console.log('Book Details:', response.data);

          if (response.data.image) {
            setBookImageURL(response.data.imageURL);
          } else {
            setBookImageURL(response.data.imageURL || '');
          }

          const serie = {
            id: response.data.serie_id,
            serieName: response.data.serie_name
          };

          const colleciton = {
            id: response.data.collection_id,
            collectionName: response.data.collection_name
          };

          setBookId(response.data.id);
          setSelectedAuthors(response.data.authors || []);
          setSelectedSerie(serie || '');
          setSerieSearch(response.data.serie_name || '');
          setSelectedCollection(colleciton || '');
          setCollectionSearch(response.data.collection_name || '');
          setFetchLoading(false);
        } catch (error) {
          console.error('Error fetching book details:', error);
          setFetchLoading(false);
        }
      };

      fetchBookDetails();
    }
  }, [bookId]);

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
              author_name: author.nickname ? author.nickname : author.authorName
            })));
            // console.log(authorOptions);
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
      // console.log('Serie Search:', serieSearch);
      if (selectedSerie && serieSearch === selectedSerie.serieName) return;
      setSelectedSerie('');
      if (serieSearch && !selectedSerie) {
        const fetchSeries = async () => {
          setSerieIsLoading(true);
          try {
            const response = await axiosUtils(`/api/search?query=${serieSearch}&type=series`, 'GET');
            setSerieOptions(response.data.results.map(serie => ({
              id: serie.id,
              serieName: serie.serieName
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (selectedCollection && collectionSearch === selectedCollection.collectionName) return;
      setSelectedCollection('');
      if (collectionSearch && !selectedCollection) {
        const fetchCollections = async () => {
          setCollectionIsLoading(true);
          try {
            const response = await axiosUtils(`/api/search?query=${collectionSearch}&type=collections`, 'GET');
            setCollectionOptions(response.data.results.map(collection => ({
              id: collection.id,
              collectionName: collection.collectionName
            })));
            setCollectionIsLoading(false);
          } catch (error) {
            console.error('Error fetching collections:', error);
          }
        };
        fetchCollections();
      } else {
        setCollectionOptions([]);
      }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(delayDebounceFn); // Clear timeout if authorSearch changes
    };

  }, [collectionSearch]);

  const handleAuthorChange = (e) => {
    setAuthorSearch(e.target.value);
  };

  const handleAuthorSelect = (author) => {
    // Allow multiple authors to be selected
    if (!selectedAuthors.some((a) => a.author_id === author.author_id)) {
      setSelectedAuthors([...selectedAuthors, author]);
    }
    setAuthorSearch('');
    setAuthorOptions([]);
  };

  const handleRemoveAuthor = (authorId) => {
    setSelectedAuthors((prev) => prev.filter((author) => author.author_id !== authorId));
  };

  const handleSerieChange = (e) => {
    setSerieSearch(e.target.value);
  };

  const handleCollectionChange = (e) => {
    setCollectionSearch(e.target.value);
  };

  const handleSerieSelect = (serie) => {
    setSelectedSerie(serie);
    setSerieSearch(serie.serieName);
    setSerieOptions([]);
  };

  const handleCollectionSelect = (collection) => {
    setSelectedCollection(collection);
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

    const bookName = formData.get('bookName') || '';
    let imageName = bookDetails.image;

    if (selectedImageFile) {
      formData.append('bookImage', selectedImageFile); // Add the uploaded image file to form data
    } else if (bookImageURL && bookImageURL !== bookDetails.imageURL) {
      const file = await downloadImage(bookImageURL, bookName);
      if (file) {
        formData.append('bookImage', file);
      } else {
        setIsLoading(false);
        return console.error('Image file not available');
      }
    } else if (!bookImageURL) {
      imageName = null;
    }

    formData.append('imageName', imageName);

    // console.log('The selected authors are:', selectedAuthors.map((author) => author.author_id).join(', '));
    formData.append('author_id', selectedAuthors.map((author) => author.author_id).join(', '));
    // console.log('The selected serie id is:', selectedSerie.id);
    formData.append('serie_id', selectedSerie.id);
    formData.append('collection_id', selectedCollection.id);

    // To log the form data:
    // for (let pair of formData.entries()) {
    //     console.log(`${pair[0]}: ${pair[1]}`);
    // }

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
      {fetchLoading ? (
        <FormSkeleton />
      ) : (
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
            {/* Display selected authors */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Selected Authors:</label>
              {selectedAuthors.length > 0 ? (
                <div className="bg-green-700 rounded-lg my-2 flex flex-wrap gap-2 p-2">
                  {selectedAuthors.map((author, index) => (
                    <span key={author.author_id} className="bg-[rgba(255,255,255,0.3)] flex items-center max-w-fit max-h-fit text-white font-poppins font-semibold px-2 py-1 rounded-lg text-sm space-x-1">
                      <span>{author.nickname || author.author_name}</span>
                      <span
                        className='text-xl cursor-pointer'
                        onClick={() => handleRemoveAuthor(author.author_id)}
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
            </div>
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
            <div className="mb-4 relative">
              <label className="block text-sm font-medium">Collection name:</label>
              <div className='flex items-center border border-gray-300 rounded-lg'>
                <input
                  type="text"
                  value={collectionSearch}
                  onChange={handleCollectionChange}
                  className="w-full border-none outline-none px-2 py-1"
                  placeholder="Search collections..."
                />
                {collectionIsLoading && (
                  <span className='px-2 mx-2 w-6 h-full green-loader'></span>
                )}
              </div>
              {collectionOptions.length > 0 ? (
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
              ) : collectionSearch && !collectionIsLoading && !selectedCollection && (
                <ul className="border border-gray-300 rounded-lg max-h-60 overflow-auto bg-white absolute w-full top-14 z-10">
                  <li
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  >
                    No collections found
                  </li>
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
              <label className="block text-sm font-medium">Custom date:</label>
              <input
                type="text"
                name="customDate"
                defaultValue={bookDetails.customDate || ''}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Amazon link:</label>
              <input
                type="text"
                name="link"
                defaultValue={bookDetails.link || ''}
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
                  <span>Saving...</span>
                </>
              ) :
                'Save Changes'
              }
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default EditBooksForm;
