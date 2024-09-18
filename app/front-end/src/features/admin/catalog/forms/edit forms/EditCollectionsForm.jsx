import React, { useState, useEffect } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../../utils/axiosUtils';
import { bufferToBlobURL, downloadImage } from '../../../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';

function EditCollectionsForm({ onClose }) {
  const initialCollectionsId = useSelector((state) => state.catalog.selectedRowIds[0]); // Assuming only one collections is selected
  const collectionId = useSelector((state) => state.catalog.collectionId);
  const [collectionsId, setCollectionsId] = useState(collectionId || initialCollectionsId);
  const [collectionsData, setCollectionsData] = useState({});
  const [collectionsImageURL, setCollectionsImageURL] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [authorSearch, setAuthorSearch] = useState('');
  const [authorOptions, setAuthorOptions] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authorIsLoading, setAuthorIsLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCollectionsData = async () => {
      try {
        const response = await axiosUtils(`/api/getCollectionById/${collectionsId}`, 'GET');
        const data = response.data;
        setCollectionsData(data);

        if (data.image) {
          setCollectionsImageURL(data.imageURL);
        } else {
          setCollectionsImageURL(data.imageURL || '');
        }

        const author = {
          id: data.author_id,
          authorName: data.nickname || data.author_name
        };

        setSelectedAuthor(author || '');
        setAuthorSearch(data.nickname || data.author_name || '');
      } catch (error) {
        console.error('Error fetching collections data:', error);
      }
    };

    fetchCollectionsData();
  }, [collectionsId]);

  useEffect(() => {
    if (selectedAuthor && authorSearch === selectedAuthor.authorName) return;
    setSelectedAuthor('');
    if (authorSearch && !selectedAuthor) {
      const fetchAuthors = async () => {
        setAuthorIsLoading(true);
        try {
          const response = await axiosUtils(`/api/search?query=${authorSearch}&type=author`, 'GET');
          setAuthorOptions(response.data.results.map(author => ({
            id: author.id,
            authorName: author.nickname || author.authorName
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
  }, [authorSearch]);

  const handleAuthorChange = (e) => {
    setAuthorSearch(e.target.value);
    if (!e.target.value) {
      setSelectedAuthor(e.target.value);
    }
  };

  const handleAuthorSelect = (author) => {
    setSelectedAuthor(author);
    setAuthorSearch(author.authorName);
    setAuthorOptions([]);
  };

  const handleImageChange = (url) => {
    // console.log('The new image url from edit series is:', url);
    setCollectionsImageURL(url);
    // console.log('The image is:', collectionsImageURL)
  };

  const handleImageUpload = (file) => {
    setSelectedImageFile(file); // Track the uploaded file
  };

  const handleSubmit = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    const formData = new FormData(event.target);
    const collectionName = formData.get('collectionName');
    let imageName = collectionsData.image;

    if (selectedImageFile) {
      formData.append('collectionsImage', selectedImageFile); // Add the uploaded image file to form data
    } else if (collectionsImageURL && collectionsImageURL !== collectionsData.imageURL) {
      const file = await downloadImage(collectionsImageURL, collectionName);
      if (file) {
        formData.append('collectionsImage', file);
      } else {
        setIsLoading(false);
        return console.error('Image file not available');
      }
    } else if (!collectionsImageURL) {
      imageName = null;
    }

    formData.append('imageName', imageName);

    formData.append('author_id', selectedAuthor.id);

    try {
      const response = await axiosUtils(`/api/updateCollection/${collectionsId}`, 'PUT', formData, {
        'Content-Type': 'multipart/form-data',
      });
      if (response.status !== 200) throw new Error('Failed to update collections');
      setIsLoading(false);
      if (onClose) onClose();
      toast.success(response.data.message);
    } catch (error) {
      setIsLoading(false);
      console.error('Error updating collections:', error);
      toast.error('Error updating the collection');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">Edit Collections</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
        <ImagePreview imageURL={collectionsImageURL} onImageChange={handleImageChange} onImageUpload={handleImageUpload} />
        <div className="md:ml-4 md:px-4 md:max-w-[23rem] md:max-h-[19rem] md:overflow-y-auto">
          <div className="mb-2">
            <label className="block text-sm font-medium">Collections Name:</label>
            <input
              type="text"
              name="collectionName"
              defaultValue={collectionsData.collectionName || ''}
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
                className="w-full border-none outline-none px-2 py-1"
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
            ) : authorSearch && !authorIsLoading && !selectedAuthor && (
              <ul className="border border-gray-300 rounded-lg max-h-60 overflow-auto bg-white absolute w-full top-14 z-10">
                <li
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  No authors found
                </li>
              </ul>
            )}
          </div>
          <div className="mb-2 flex space-x-2">
            <div>
              <label className="block text-sm font-medium">Number of Books:</label>
              <input
                type="number"
                name="numBooks"
                defaultValue={collectionsData.numBooks || ''}
                className="w-full border border-gray-300 rounded-lg px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Genres:</label>
              <input
                type="text"
                name="genres"
                defaultValue={collectionsData.genres || ''}
                className="w-full border border-gray-300 rounded-lg px-2 py-1"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Collections Link:</label>
            <input
              type="text"
              name="link"
              defaultValue={collectionsData.link || ''}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
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

export default EditCollectionsForm;
