import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../utils/axiosUtils';
import { calculateAgeAtDeath, capitalize, capitalizeGenres, formatSeriesName, spacesToHyphens } from '../../../utils/stringUtils';
import { bufferToBlobURL } from '../../../utils/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { NewspaperIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Recommendations from '../recommendations/Recommendations';
import NotFoundPage from '../../../pages/NotFoundPage';
import blank_image from '../../../assets/brand_blank_image.png'
import DeatailsPageSkeleton from '../../../components/skeletons/DeatailsPageSkeleton';
import { useSocket } from '../../../context/SocketContext';
import NetworkErrorPage from '../../../pages/NetworkErrorPage';
import { sortByFirstBookYearAsc, sortByPublishDateDesc } from '../../../utils/sortingUtils';

function AuthorDetails() {

  const activeTab = useSelector((state) => state.user.activeTab);
  const { authorId, author_name } = useParams();
  const [authorData, setAuthorData] = useState({});
  const [series, setSeries] = useState([]);
  const [books, setBooks] = useState([]);
  const [IsLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const [seriesLimit, setSeriesLimit] = useState();
  const [booksLimit, setBooksLimit] = useState();
  const [groupRange, setGroupRange] = useState();
  const [booksRange, setBooksRange] = useState();
  const [seriesCount, SetSeriesCount] = useState();
  const [booksCount, SetBooksCount] = useState();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [jsonLD, setJsonLD] = useState(null);

  useEffect(() => {

    const updatePageLimitAndInterval = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setSeriesLimit(4);
        setGroupRange(4);
        setBooksLimit(6);
        setBooksRange(6);
      } else {
        setSeriesLimit(3);
        setGroupRange(3);
        setBooksLimit(5);
        setBooksRange(5);
      }
    };

    updatePageLimitAndInterval();
    window.addEventListener('resize', updatePageLimitAndInterval);

    return () => {
      window.removeEventListener('resize', updatePageLimitAndInterval);
    };
  }, [authorId]);

  useEffect(() => {
    const fetchBooksData = async () => {
      setIsLoading(true);
      try {
        const authorResponse = await axiosUtils(`/api/getAuthorById/${authorId}`, 'GET');

        console.log('Author response:', authorResponse.data);

        // Adding the age property to the author data
        const authorDataWithAge = {
          ...authorResponse.data,
          age: calculateAgeAtDeath(authorResponse.data.dob, authorResponse.data.dod),
        };
        // console.log('Author age at death:', authorDataWithAge.age);

        setAuthorData(authorDataWithAge);

        // console.log('The author name is:', author_name);

        // If author_name is not in the URL, update it
        if (!author_name || author_name !== authorResponse.data.author_name) {
          navigate(`/authors/${authorId}/${spacesToHyphens(authorResponse.data.author_name)}`, { replace: true });
        }

        // Update the tab title with the series name
        document.title = `${capitalize(authorResponse.data.author_name)} - readrack`;

        // Update the meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', authorResponse.data.biography || "Default description here");
        } else {
          // If the description meta tag doesn't exist, create it
          const newMetaDescription = document.createElement('meta');
          newMetaDescription.name = 'description';
          newMetaDescription.content = authorResponse.data.biography || "Default description here";
          document.head.appendChild(newMetaDescription);
        }

        // Fetching series by the author
        const seriesResponse = await axiosUtils(`/api/getSeriesByAuthorId/${authorResponse.data.id}`, 'GET');
        // console.log('Series response:', seriesResponse.data); // Debugging

        const sortedSeries = seriesResponse.data.series.sort(sortByFirstBookYearAsc);

        setSeries(sortedSeries);
        SetSeriesCount(seriesResponse.data.series.length);

        // Fetching books by the author
        const booksResponse = await axiosUtils(`/api/getBooksByAuthorId/${authorResponse.data.id}`, 'GET');
        // console.log('Books response:', booksResponse.data); // Debugging

        // Sort the books by publish date or custom date
        const sortedBooks = booksResponse.data.books.sort(sortByPublishDateDesc);

        setBooks(sortedBooks);
        SetBooksCount(booksResponse.data.totalCount);

        const authorJsonLD = {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": authorData.author_name,
          "image": authorData.imageURL,
          "birthDate": authorData.dob,
          "deathDate": authorData.dod,
          "nationality": authorData.nationality,
          "genre": authorData.genre,
          "description": authorData.biography,
          "url": window.location.href, // URL to the author's page
          "sameAs": [
            authorData.website,
            authorData.x,
            authorData.instagram,
            authorData.facebook
          ].filter(Boolean), // Remove any empty social media links
        };

        setJsonLD(authorJsonLD);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching books data:', error);
        if (error.message === "Network Error" || error.response.status === 500 || error.response.status === 501) {
          setNetworkError(true);
        } else if (error.response && error.response.status === 404) {
          setNotFound(true);
        }
        setIsLoading(false);
      }
    };

    fetchBooksData();

  }, [authorId, author_name, navigate]);

  const handleSetLimit = (type) => {
    if (type == 'series') {
      if (window.innerWidth >= 1024) {
        setSeriesLimit(seriesLimit === 4 ? seriesCount : 4);
      } else {
        setSeriesLimit(seriesLimit === 3 ? seriesCount : 3);
      }
      // console.log('Series limit set to:', seriesLimit);
    } else {
      if (window.innerWidth >= 1024) {
        setBooksLimit(booksLimit === 6 ? booksCount : 6);
      } else {
        setBooksLimit(booksLimit === 5 ? booksCount : 5);
      }
      // console.log('Books limit set to:', booksLimit);
    }
  }

  if (IsLoading) {
    return <DeatailsPageSkeleton activeTab={activeTab} admin={false} />;
  } else if (notFound) {
    return <NotFoundPage type='author' />
  } else if (networkError) {
    return <NetworkErrorPage />
  }

  return (
    <div className='px-[4%] sm:px-[12%]'>

      {/* Your existing JSX content */}

      {jsonLD && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
        />
      )}

      <div className='md:flex md:flex-row md:space-x-6 xl:space-x-8 mb-10'>
        <div className='w-full pt-2 md:w-[22rem] md:h-full md:sticky md:top-20 lg:top-[4rem] overflow-auto'>
          <div className=' max-w-[13rem] mx-auto'>
            <img src={authorData.imageURL || blank_image} alt="" className='h-[16rem] w-full bg-[rgba(3,149,60,0.08)] rounded-lg mx-auto object-cover' loading="lazy" />
            <div className='w-full mx-auto'>
              <p
                title={capitalize(authorData.author_name)}
                className='font-poppins text-lg text-center md:text-left mt-2 mb-2 cursor-default'
              >
                {capitalize(authorData.author_name)}
              </p>
              <div className='font-arima font-medium text-sm text-center md:text-left'>
                <span>{capitalize(authorData.nationality)}</span>
                <span className={`${authorData.dob || authorData.customDob ? 'inline' : 'hidden'}`}>,</span>
                <span className={`${authorData.dob || authorData.customDob ? 'block' : 'hidden'}`}>Born on {authorData.dob}</span>
              </div>
              {authorData.dod && (
                <>
                  <p className='font-arima font-medium text-sm text-center md:text-left mt-2'>Died on {authorData.dod},</p>
                  <p className='font-arima font-medium text-sm text-center md:text-left'> at {authorData.age} years old.</p>
                </>
              )}
              <div className='w-full md:items-center mt-4 leading-3 md:max-w-[90%]'>
                <p className='md:inline font-poppins font-semibold text-center md:text-left text-sm'>Genres:</p>
                <div className='md:inline flex flex-wrap gap-x-2 md:ml-1 text-sm text-center md:text-left font-arima items-center justify-center md:justify-start w-[90%] mx-auto'>
                  {capitalizeGenres(authorData.genre)}
                </div>
              </div>
              <div className='flex justify-evenly items-center mt-4'>
                {authorData.website &&
                  <a
                    href={authorData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <NewspaperIcon title={`${capitalize(authorData.author_name)}'s Website`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
                {authorData.x &&
                  <a
                    href={authorData.x}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaXTwitter title={`${capitalize(authorData.author_name)}'s X`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
                {authorData.instagram &&
                  <a
                    href={authorData.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram title={`${capitalize(authorData.author_name)}'s Instagram`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
                {authorData.facebook &&
                  <a
                    href={authorData.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook title={`${capitalize(authorData.author_name)}'s Facebook`} className="w-10 h-10 inline p-2 cursor-pointer rounded-lg on-click" />
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
        <div className='w-full md:mt-2 mb-2'>
          <div className='mt-6 md:mt-0'>
            <p className='font-poppins font-semibold text-lg 2xl:text-center mb-2'>About {capitalize(authorData.author_name)}:</p>
            <p className='font-arima'>{authorData.biography}</p>
            <div className={`${authorData.awards ? 'block' : 'hidden'} mt-2`}>
              <p className='inline font-medium font-poppinstext-left text-sm'>Awards:</p>
              <div className='inline ml-1 text-sm font-arima  w-[90%] mx-auto'>
                {authorData.awards}
              </div>
            </div>
          </div>

          {/* Author series */}
          {series.length > 0 && (
            <>
              <div className='flex justify-between items-center mt-8 md:mt-6'>
                <p className='font-poppins font-semibold text-lg 2xl:text-center'>
                  {capitalize(authorData.author_name)} Series:
                </p>
              </div>
              <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
                {series.slice(0, seriesLimit).map((item, index) => (
                  <div
                    key={item.id}
                    className='flex space-x-2 mt-4 pb-3 border-b-2 border-gray-300 cursor-pointer'
                  >
                    <img
                      src={item.imageURL || blank_image} // Fallback image if Blob URL is null
                      alt=''
                      className='bg-[rgba(3,149,60,0.08)] min-h-[9rem] w-[6rem] rounded-lg object-cover'
                      loading="lazy"
                    />
                    <div className='min-h-full w-full flex flex-col'>
                      <div
                        className='flex justify-between items-center'
                      // onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`/series/${item.id}/${spacesToHyphens(item.serie_name)}`}
                          className='m-0 leading-5 text-lg hover:underline'
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/series/${item.id}/${spacesToHyphens(item.serie_name)}`);
                          }}
                        >
                          {formatSeriesName(item.serie_name)}
                        </a>
                      </div>
                      <p className='font-arima text-sm mt-2'>by {item.authors.map(author => capitalize(author.author_name)).join(', ')}</p>
                      <p className='font-arima text-gray-400 text-sm'>
                        {item.first_book_year && item.last_book_year ? `from ${item.first_book_year} to ${item.last_book_year}` : 'Coming soon'}
                      </p>
                      {item.amazon_link &&
                        <a
                          href={item.amazon_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className='bg-primary block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto on-click-amzn'
                        >
                          Find on Amazon
                        </a>
                      }
                    </div>
                  </div>
                ))}
              </div>
              {(seriesCount > seriesLimit || seriesLimit > groupRange) && (
                <span
                  onClick={() => handleSetLimit('series')}
                  className='text-sm max-w-fit mt-2 hover:underline text-green-700 font-semibold font-arima cursor-pointer'
                >
                  {seriesLimit < seriesCount ? 'Show more' : 'Show less'}
                </span>
              )}
            </>
          )}

          {/* Author Books */}
          <div className='flex justify-between items-center mt-8 md:mt-12'>
            <p className='font-poppins font-semibold text-lg 2xl:text-center'>
              Standalone {capitalize(authorData.author_name)} Books:
            </p>
          </div>
          <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
            {books.slice(0, booksLimit).map((item, index) => (
              <div key={item.id} className='flex space-x-2 mt-4 pb-3 border-b-2 border-gray-300 cursor-default'>
                <img
                  src={item.imageURL || blank_image} // Fallback image if Blob URL is null
                  alt='book image'
                  className='bg-[rgba(3,149,60,0.08)] min-h-[9rem] w-[6rem] rounded-lg object-cover'
                  loading="lazy"
                />
                <div className='min-h-full w-full flex flex-col justify-between'>
                  <div className='flex justify-between items-center'>
                    <p className='m-0 leading-5 text-lg'>
                      {capitalize(item.book_name)}
                    </p>
                  </div>
                  <p className='font-arima text-sm mt-2'>by  {item.authors.map(author => capitalize(author.author_name)).join(', ')}</p>
                  <p className='font-arima text-slate-400 text-sm'>
                    published {item.publish_date || item.publish_year}
                  </p>
                  <a
                    href={
                      item.amazon_link ||
                      `https://www.amazon.com/s?k=${encodeURIComponent(`${item.book_name} by ${item.authors.map(author => author.author_name).join(', ')}`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className='bg-primary block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto on-click-amzn'
                  >
                    Find on Amazon
                  </a>
                </div>
              </div>
            ))}
          </div>
          {(booksCount > booksLimit || booksLimit > booksRange) && (
            <span
              onClick={() => handleSetLimit('books')}
              className='text-sm max-w-fit mt-2 hover:underline text-green-700 font-semibold font-arima cursor-pointer'
            >
              {booksLimit < booksCount ? 'Show more' : 'Show less'}
            </span>
          )}
        </div>
      </div>
      <Recommendations data={authorData} />
    </div>
  );
}

export default AuthorDetails;
