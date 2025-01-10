import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../utils/axiosUtils';
import { capitalize, capitalizeGenres, formatSeriesName, spacesToHyphens } from '../../../utils/stringUtils';
import { bufferToBlobURL } from '../../../utils/imageUtils';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Recommendations from '../recommendations/Recommendations';
import NotFoundPage from '../../../pages/NotFoundPage';
import blank_image from '../../../assets/brand_blank_image.png';
import DeatailsPageSkeleton from '../../../components/skeletons/DeatailsPageSkeleton';
import NetworkErrorPage from '../../../pages/NetworkErrorPage';
import { sortByPublishDateDesc, sortBySerieIndexAsc } from '../../../utils/sortingUtils';
import { toWords } from 'number-to-words';

function SerieDetails() {

  const activeTab = useSelector((state) => state.user.activeTab);
  const { serieId, serie_name } = useParams();
  const [serieData, setSerieData] = useState({});
  const [books, setBooks] = useState([]);
  const [IsLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const [booksLimit, setBooksLimit] = useState();
  const [booksRange, setBooksRange] = useState();
  const [booksCount, SetBooksCount] = useState();
  const [jsonLD, setJsonLD] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const updatePageLimitAndInterval = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setBooksLimit(6);
        setBooksRange(6);
      } else {
        setBooksLimit(5);
        setBooksRange(5);
      }
    };

    updatePageLimitAndInterval();
    window.addEventListener('resize', updatePageLimitAndInterval);

    return () => {
      window.removeEventListener('resize', updatePageLimitAndInterval);
    };
  }, [serieId]);

  useEffect(() => {
    const fetchSeriesData = async () => {
      setIsLoading(true);
      try {
        const serieResponse = await axiosUtils(`/api/getSerieById/${serieId}`, 'GET');
        setSerieData(serieResponse.data);

        console.log('The serie data are:', serieResponse.data);

        // Update the tab title with the series name
        document.title = `${formatSeriesName(serieResponse.data.serie_name)} by ${serieResponse.data.authors[0].author_name} - readrack`;

        // Dynamically create the canonical URL
        const canonicalUrl = `https://readrack.net/series/${serieId}/${spacesToHyphens(serieResponse.data.serie_name)}`;

        // Update the canonical link tag in the <head>
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        if (canonicalLink) {
          canonicalLink.setAttribute('href', canonicalUrl);
        } else {
          const linkElement = document.createElement('link');
          linkElement.setAttribute('rel', 'canonical');
          linkElement.setAttribute('href', canonicalUrl);
          document.head.appendChild(linkElement);
        }

        // Update the meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', `Discover the complete publication order of ${serieResponse.data.serie_name} series by ${serieResponse.data.authors[0].author_name}, featuring all books in the series.` || "Default description here");
        } else {
          // If the description meta tag doesn't exist, create it
          const newMetaDescription = document.createElement('meta');
          newMetaDescription.name = 'description';
          newMetaDescription.content = `Discover the complete publication order of ${serieResponse.data.serie_name} series by ${serieResponse.data.authors[0].author_name}, featuring all books in the series.` || "Default description here";
          document.head.appendChild(newMetaDescription);
        }

        // If serie_name is not in the URL, update it
        if (!serie_name || serie_name !== serieResponse.data.serie_name) {
          navigate(`/series/${serieId}/${spacesToHyphens(serieResponse.data.serie_name)}`, { replace: true });
        }

        const booksResponse = await axiosUtils(`/api/getBooksBySerieId/${serieResponse.data.id}`, 'GET');
        console.log('Books response:', booksResponse.data); // Debugging

        // Sort the books by publish date or custom date
        const sortedBooks = booksResponse.data.books.sort(sortBySerieIndexAsc);

        setBooks(sortedBooks);
        SetBooksCount(booksResponse.data.totalCount);

        // Generate workExample from books
        const workExamples = sortedBooks.map((book) => ({
          "@type": "Book",
          "name": book.title, // Assuming book has a 'title' property
          "bookFormat": "https://schema.org/paperback", // Change this if needed
        }));

        const generatedJsonLD = {
          "@context": "https://schema.org",
          "@type": "BookSeries",
          "name": `${serieResponse.data.serie_name}`,
          "description": `Complete publication order of ${serieResponse.data.serie_name}: A ${toWords(serieResponse.data.num_books)}-book series by ${serieResponse.data.authors[0].author_name}.`,
          "url": window.location.href,
          "author": {
            "@type": "Person",
            "name": `${serieResponse.data.authors[0].author_name}`
          },
          "numberOfBooks": serieResponse.data.num_books,
          "genre": `${serieResponse.data.genre}`,
          // "sameAs": "https://en.wikipedia.org/wiki/Harry_Potter",
          "workExample": booksResponse.data.books.map(book => ({
            "@type": "Book",
            "name": book.book_name,
            "bookFormat": "https://schema.org/Paperback",
            "url": book.amazon_link,  // You can add more attributes like URL to the Amazon page if needed
            "image": book.image_link, // You can include the book image URL
          }))
        }

        setJsonLD(generatedJsonLD);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching series data:', error);
        if (error.message === "Network Error" || error.response.status === 500 || error.response.status === 501) {
          setNetworkError(true);
        } else if (error.response && error.response.status === 404) {
          setNotFound(true);
        }
        setIsLoading(false);
      }
    };

    fetchSeriesData();

  }, [serieId, serie_name, navigate]);

  const handleSetLimit = () => {
    if (window.innerWidth >= 1024) {
      setBooksLimit(booksLimit === 6 ? booksCount : 6);
    } else {
      setBooksLimit(booksLimit === 5 ? booksCount : 5);
    }
    // console.log('Books limit set to:', booksLimit);
  }

  if (IsLoading) {
    return <DeatailsPageSkeleton activeTab={activeTab} admin={false} />;
  } else if (notFound) {
    return <NotFoundPage type='serie' />
  } else if (networkError) {
    return <NetworkErrorPage />
  }


  return (
    <div className=' px-[4%] sm:px-[12%]'>

      {/* Adding JSON-LD structured data in a <script> tag */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLD)}
      </script>

      <div className='md:flex md:flex-row pt-2 md:space-x-6 xl:space-x-8 pb-10'>
        <div className='w-full pt-2 md:w-[22rem] md:h-full md:sticky md:top-20 lg:top-[4.5rem] overflow-hidden'>
          <div className=' max-w-[13rem] mx-auto'>
            <img src={serieData.imageURL || blank_image} alt="" className='h-[16rem] w-full bg-[rgba(3,149,60,0.08)] rounded-lg mx-auto object-cover' loading="lazy" />
            <div className='w-full mx-auto'>
              <p
                title={formatSeriesName(serieData.serie_name)}
                className='font-poppins font-medium text-lg text-center md:text-left mt-2 md:overflow-hidden md:whitespace-nowrap md:text-ellipsis cursor-default'
              >
                {formatSeriesName(serieData.serie_name)}
              </p>
              <p
                className='font-arima text-center md:text-left'
              >
                <span>by </span>
                {serieData.authors.map(author => (
                  <span
                    key={author.author_id}
                    className='hover:underline cursor-pointer'
                    onClick={() => navigate(`/authors/${author.author_id}/${spacesToHyphens(author.author_name)}`)}
                  >
                    {capitalize(author.author_name)}
                  </span>
                )).reduce((prev, curr) => [prev, ', ', curr])}
              </p>
              <div className='w-full md:items-center mt-4 leading-3 md:max-w-[90%]'>
                <p className='md:inline font-medium font-poppins text-center md:text-left text-sm'>Genres:</p>
                <div className='md:inline flex flex-wrap gap-x-2 md:ml-1 text-sm text-center md:text-left font-arima items-center justify-center md:justify-start w-[90%] mx-auto'>
                  {capitalizeGenres(serieData.genre)}
                </div>
              </div>
            </div>
          </div>
          {serieData.amazon_link &&
            <a
              href={serieData.amazon_link}
              target="_blank"
              rel="noopener noreferrer"
              className='bg-[#37643B] block w-[60%] md:w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mx-auto mt-6 on-click-amzn'>
              Find on Amazon
            </a>
          }
        </div>
        <div className='w-full '>
          <div className='flex justify-between items-center mt-12 md:mt-0'>
            <p className='font-poppins font-semibold text-xl 2xl:text-center'>
              {capitalize(serieData.serie_name)} Books:
            </p>
          </div>
          <div className='w-full grid 2xl:grid lg:grid-cols-2 gap-x-4'>
            {books.slice(0, booksLimit).map((item, index) => (
              <div key={item.id} className='flex space-x-2 mt-4 pb-3 border-b-2 border-gray-100 cursor-default'>
                <img
                  src={item.imageURL || blank_image} // Fallback image if Blob URL is null
                  alt=''
                  className='bg-[rgba(3,149,60,0.08)] min-h-[9rem] w-[6rem] rounded-lg object-cover'
                  loading="lazy"
                />
                <div className='min-h-full w-full flex flex-col'>
                  <div className='flex justify-between items-center max-w-full'>
                    <p className='m-0 leading-5 text-lg'>
                      {capitalize(item.book_name)}
                    </p>
                  </div>
                  <p className='font-arima text-sm mt-2'>by {item.authors.map(author => capitalize(author.author_name)).join(', ')}</p>
                  <p className='font-arima text-slate-400 text-sm'>
                    #{item.serie_index}, published {item.publish_date || item.publish_year}
                  </p>
                  <a
                    href={
                      item.amazon_link ||
                      `https://www.amazon.com/s?k=${encodeURIComponent(`${item.book_name} by ${item.authors.map(author => author.author_name).join(', ')}`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className='bg-[#37643B] block w-full text-center text-white text-sm font-semibold font-poppins p-3 rounded-lg mt-auto on-click-amzn'
                  >
                    Find on Amazon
                  </a>
                </div>
              </div>
            ))}
          </div>
          {(booksCount > booksLimit || booksLimit > booksRange) && (
            <span
              onClick={() => handleSetLimit()}
              className='text-sm max-w-fit mt-2 hover:underline text-green-700 font-semibold font-arima cursor-pointer'
            >
              {booksLimit < booksCount ? 'Show more' : 'Show less'}
            </span>
          )}
        </div>
      </div>
      <Recommendations data={serieData} />
    </div>
  );
}

export default SerieDetails
