import React, { useState, useEffect } from 'react';
import ImagePreview from './ImagePreview';
import axiosUtils from '../../../../../utils/axiosUtils';
import { bufferToBlobURL, downloadImage } from '../../../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import FormSkeleton from '../../../../../components/skeletons/FormSkeleton';

function EditAuthorForm({ onClose }) {
  const initialAuthorId = useSelector((state) => state.catalog.selectedRowIds[0]); // Assuming only one author is selected
  const [authorId, setAuthorId] = useState(initialAuthorId);
  const [authorData, setAuthorData] = useState({});
  const [authorImageURL, setAuthorImageURL] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch author data when the component mounts
    const fetchAuthorData = async () => {
      setFetchLoading(true);
      try {
        const response = await axiosUtils(`/api/getAuthorById/${authorId}`, 'GET');
        // console.log('Author data fetched:', response.data); // Log the entire response data

        setAuthorData(response.data);
        // console.log('Author data:', response.data);

        if (response.data.image) {
          setAuthorImageURL(response.data.imageURL);
        } else {
          setAuthorImageURL(response.data.imageURL || ''); // Fallback if image data is not available
        }

        setAuthorId(response.data.id);
        setFetchLoading(false);
      } catch (error) {
        console.error('Error fetching author data:', error);
        setFetchLoading(false);
      }
    };

    fetchAuthorData();
  }, [authorId]);

  const handleImageChange = (url) => {
    setAuthorImageURL(url);
  };

  const handleImageUpload = (file) => {
    setSelectedImageFile(file); // Track the uploaded file
  };

  const handleSubmit = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    const formData = new FormData(event.target);

    // Extract last name from the full name
    const fullName = formData.get('authorName') || '';
    const nameParts = fullName.trim().split(' ');
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
    let imageName = authorData.image;

    if (selectedImageFile) {
      formData.append('authorsImage', selectedImageFile); // Add the uploaded image file to form data
    } else if (authorImageURL && authorImageURL !== authorData.imageURL) {
      const file = await downloadImage(authorImageURL, lastName);
      if (file) {
        formData.append('authorsImage', file);
      } else {
        setIsLoading(false);
        return console.error('Image file not available');
      }
    } else if (!authorImageURL) {
      imageName = null;
    }

    formData.append('imageName', imageName);

    // Log form data entries
    for (let [key, value] of formData.entries()) {
      // console.log(`${key}: ${value}`);
    }

    try {
      const response = await axiosUtils(`/api/updateAuthor/${authorId}`, 'PUT', formData, {
        'Content-Type': 'multipart/form-data',
      });
      if (response.status !== 200) throw new Error('Failed to update author');
      // console.log('Author updated successfully');
      setIsLoading(false);
      if (onClose) onClose();
      toast.success(response.data.message);

    } catch (error) {
      setIsLoading(false);
      console.error('Error updating author:', error.response ? error.response.data : error.message);
      toast.error('Error updating the author');
    }
  };

  return (
    <div className=''>
      <h2 className="text-lg font-semibold">Edit Author</h2>
      {fetchLoading ? (
        <FormSkeleton />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row max-h-custom2 md:max-h-fit overflow-y-auto md:overflow-hidden">
          <ImagePreview imageURL={authorImageURL} onImageChange={handleImageChange} onImageUpload={handleImageUpload} />
          <div className="md:ml-4 md:px-4 md:max-w-[23rem] md:max-h-[19rem] md:overflow-y-auto">
            <div className="mb-2">
              <label className="block text-sm font-medium">Author name:</label>
              <input
                type="text"
                name="authorName"
                defaultValue={authorData.authorName || ''}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium">Author nickname:</label>
              <input
                type="text"
                name="nickname"
                defaultValue={authorData.nickname || ''}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
              />
            </div>
            <div className="mb-2 flex space-x-2">
              <div className='w-full'>
                <label className="block text-sm font-medium">Date of birth:</label>
                <input
                  type="date"
                  name="dob"
                  defaultValue={authorData.dob?.split('T')[0] || ''}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                />
              </div>
              <div className='w-full'>
                <label className="block text-sm font-medium">Date of death:</label>
                <input
                  type="date"
                  name="dod"
                  defaultValue={authorData.dod?.split('T')[0] || ''}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Custom date of birth:</label>
              <input
                type="text"
                name="customDob"
                defaultValue={authorData.customDob || ''}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium">Nationality:</label>
              <input
                type="text"
                name="nationality"
                defaultValue={authorData.nationality || ''}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:border-green-700 focus:ring-green-700"
              />
            </div>
            <div className="mb-2 flex space-x-2">
              <div className='w-full'>
                <label className="block text-sm font-medium">Biography:</label>
                <textarea
                  name="biography"
                  defaultValue={authorData.biography || ''}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                />
              </div>
              <div className='w-full'>
                <label className="block text-sm font-medium">Awards:</label>
                <textarea
                  name="awards"
                  defaultValue={authorData.awards || ''}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                />
              </div>
            </div>
            <div className="mb-2 flex space-x-2">
              <div>
                <label className="block text-sm font-medium">X:</label>
                <input
                  type="text"
                  name="x"
                  defaultValue={authorData.x || ''}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                  onClick={(e) => e.target.select()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Instagram:</label>
                <input
                  type="text"
                  name="instagram"
                  defaultValue={authorData.instagram || ''}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                  onClick={(e) => e.target.select()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Facebook:</label>
                <input
                  type="text"
                  name="facebook"
                  defaultValue={authorData.facebook || ''}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                  onClick={(e) => e.target.select()}
                />
              </div>
            </div>
            <div className="mb-4 flex space-x-2">
              <div>
                <label className="block text-sm font-medium">Website:</label>
                <input
                  type="text"
                  name="website"
                  defaultValue={authorData.website || ''}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                  onClick={(e) => e.target.select()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Genres:</label>
                <input
                  type="text"
                  name="genres"
                  defaultValue={authorData.genres || ''}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1"
                />
              </div>
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

export default EditAuthorForm;
