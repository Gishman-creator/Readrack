import React, { useState, useEffect } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../../utils/axiosUtils';
import { bufferToBlobURL, downloadImage } from '../../../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import FormSkeleton from '../../../../../components/skeletons/FormSkeleton';

function EditSeriesForm({ onClose }) {
  const initialSeriesId = useSelector((state) => state.catalog.selectedRowIds[0]); // Assuming only one series is selected
  const serieId = useSelector((state) => state.catalog.serieId);
  const [seriesId, setSeriesId] = useState(serieId || initialSeriesId);
  const [seriesData, setSeriesData] = useState({});
  const [seriesImageURL, setSeriesImageURL] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [authorSearch, setAuthorSearch] = useState('');
  const [authorOptions, setAuthorOptions] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);

  const [collectionSearch, setCollectionSearch] = useState('');
  const [collectionOptions, setCollectionOptions] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]); // Stores selected collection names
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]); // Stores collection IDs
  const [relatedCollections, setRelatedCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authorIsLoading, setAuthorIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSeriesData = async () => {
      setFetchLoading(true);
      try {
        const response = await axiosUtils(`/api/getSerieById/${seriesId}`, 'GET');
        // console.log('The serie data are:', response.data);
        const data = response.data;
        setSeriesData(data);

        if (data.image) {
          setSeriesImageURL(data.imageURL);
        } else {
          setSeriesImageURL(data.imageURL || '');
        }

        setSelectedAuthors(response.data.authors || '');

        // Fetch related collections
        if (data.related_collections) {
          const collectionIds = data.related_collections.split(',');
          const collectionNames = await Promise.all(
            collectionIds.map(async (id) => {
              const res = await axiosUtils(`/api/getCollectionById/${id}`, 'GET');
              return res.data.collectionName;
            })
          );
          setSelectedCollections(collectionNames);
          setSelectedCollectionIds(collectionIds.map(Number));
        }
        setFetchLoading(false);

      } catch (error) {
        console.error('Error fetching series data:', error);
        setFetchLoading(false);
      }
    };

    fetchSeriesData();
  }, [seriesId]);

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
              author_name: author.nickname || author.authorName
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
      if (collectionSearch) {
        const fetchCollections = async () => {
          try {
            const response = await axiosUtils(`/api/search?query=${collectionSearch}&type=collections`, 'GET');
            // console.log('The found collections are:', response)
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

  const handleCollectionSelect = (collection) => {
    // Prevent duplicate entries
    if (!selectedCollectionIds.includes(collection.id)) {
      setSelectedCollections([...selectedCollections, collection.collectionName]);
      setSelectedCollectionIds([...selectedCollectionIds, collection.id]);
    }
    setCollectionSearch(''); // Clear the search input after selection
    setCollectionOptions([]);
  };

  const handleCollectionRemove = (index) => {
    const updatedCollections = [...selectedCollections];
    const updatedCollectionIds = [...selectedCollectionIds];
    updatedCollections.splice(index, 1);
    updatedCollectionIds.splice(index, 1);
    setSelectedCollections(updatedCollections);
    setSelectedCollectionIds(updatedCollectionIds);
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

    formData.append('related_collections', selectedCollectionIds);
    let imageName = seriesData.image;

    if (selectedImageFile) {
      formData.append('seriesImage', selectedImageFile); // Add the uploaded image file to form data
    } else if (seriesImageURL && seriesImageURL !== seriesData.imageURL) {
      const file = await downloadImage(seriesImageURL, seriesData.serieName);
      if (file) {
        formData.append('seriesImage', file);
      } else {
        setIsLoading(false);
        return console.error('Image file not available');
      }
    } else if (!seriesImageURL) {
      imageName = null;
    }

    formData.append('imageName', imageName);

    formData.append('author_id', selectedAuthors.map((author) => author.author_id).join(', '));

    try {
      const response = await axiosUtils(`/api/updateSerie/${seriesId}`, 'PUT', formData, {
        'Content-Type': 'multipart/form-data',
      });
      if (response.status !== 200) throw new Error('Failed to update series');
      setIsLoading(false);
      if (onClose) onClose();
      toast.success(response.data.message);
    } catch (error) {
      setIsLoading(false);
      console.error('Error updating series:', error);
      toast.error('Error updating the serie');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">Edit Series</h2>
      {fetchLoading ? (
        <FormSkeleton />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
          <ImagePreview imageURL={seriesImageURL} onImageChange={handleImageChange} onImageUpload={handleImageUpload} />
          <div className="md:ml-4 md:px-4 md:max-w-[23rem] md:max-h-[19rem] md:overflow-y-auto">
            <div className="mb-2">
              <label className="block text-sm font-medium">Series Name:</label>
              <input
                type="text"
                name="serieName"
                defaultValue={seriesData.serieName || ''}
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
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
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
              <label className="block text-sm font-medium">Search Collections:</label>
              <input
                type="text"
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-2 py-1"
                placeholder="Search collections..."
              />
              {collectionOptions.length > 0 && (
                <ul className="border border-gray-300 rounded-lg mt-2 max-h-60 overflow-auto bg-white absolute w-full z-10">
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
            {selectedCollections.length > 0 && (
              <div className="bg-green-700 rounded-lg mt-2 flex flex-wrap gap-2 p-2">
                {selectedCollections.map((collection, index) => (
                  <span key={index} className="bg-[rgba(255,255,255,0.3)] flex items-center max-w-fit max-h-fit text-white font-poppins font-semibold px-2 py-1 rounded-lg text-sm space-x-1">
                    <span>{collection}</span>
                    <span
                      className='text-xl cursor-pointer'
                      onClick={() => handleCollectionRemove(index)}
                    >
                      &times;
                    </span>
                  </span>
                ))}
              </div>
            )}
            <div className="mb-2 flex space-x-2">
              <div>
                <label className="block text-sm font-medium">Number of Books:</label>
                <input
                  type="number"
                  name="numBooks"
                  defaultValue={seriesData.numBooks || ''}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Genres:</label>
                <input
                  type="text"
                  name="genres"
                  defaultValue={seriesData.genres || ''}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Series Link:</label>
              <input
                type="text"
                name="link"
                defaultValue={seriesData.link || ''}
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

export default EditSeriesForm;
