import React from 'react';
import blank_image from '../../../assets/brand_blank_image.png';
import { capitalize, spacesToHyphens } from '../../../utils/stringUtils';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setActiveGenre } from '../slices/userSlice';
import { incrementSearchCount } from '../../../utils/searchCountUtils';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function Card({ card, activeTab, fixedWidth }) {
    // console.log('The cardData from card.jsx', card.image);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // console.log('The card image url is:', card);

    const navigateToDetails = (id) => {
        if (activeTab === 'Series') {
            incrementSearchCount('series', id);
            navigate(`/series/${card.id}/${spacesToHyphens(card.serieName)}`);
        } else if (activeTab === 'Collections') {
            incrementSearchCount('collections', id);
            navigate(`/collections/${card.id}/${spacesToHyphens(card.collectionName)}`);
        } else {
            incrementSearchCount('authors', id);
            navigate(`/authors/${card.id}/${spacesToHyphens(card.authorName)}`);
        }
        dispatch(setActiveGenre(''));
        window.scrollTo({ top: 0 });
    };

    const navigateToAuthor = (e, author) => {
        e.stopPropagation(); // Prevent the card's onClick from triggering
        incrementSearchCount('author', author.author_id);
        navigate(`/authors/${author.author_id}/${spacesToHyphens(author.author_name)}`);
    };

    return (
        <div
            className={`${fixedWidth ? 'min-w-[10rem]' : 'w-full'} md:max-w-[10rem] group hover:border-[#e1e1e1] rounded-md cursor-pointer mb-7`}
            onClick={() => navigateToDetails(card.id)}
        >
            <div className="relative overflow-hidden rounded-lg duration-300 group-hover:shadow-custom3">
                <img
                    src={card.imageURL || blank_image}
                    alt=''
                    className="bg-[rgba(3,149,60,0.08)] h-48 w-full transform transition-transform duration-300 group-hover:scale-105 object-cover"
                    loading="lazy"
                />
                {card.searchCount > 5 && (
                    <div
                        title={`Searched by ${card.searchCount} people`}
                        className='absolute bg-[rgba(0,0,0,0.7)] hover:bg-[rgba(0,0,0,0.8)] hover:scale-105 text-white flex justify-between items-center top-1 right-1 z-[5] rounded-lg py-[2px] px-[6px] space-x-1'
                    >
                        <p className='font-poppins font-semibold text-xs'>{card.searchCount}</p>
                        <MagnifyingGlassIcon className='w-3 h-3' />
                    </div>
                )}
            </div>
            <div className="flex-col justify-center items-center py-1">
                <p
                    title={`
                        ${activeTab === 'Series' ? `${capitalize(card.serieName)} Series` : ''}
                        ${activeTab === 'Authors' ? (card.nickname ? capitalize(card.nickname) : capitalize(card.authorName)) : ''}
                        ${activeTab === 'Collections' ? capitalize(card.collectionName) : ''}
                    `}
                    className="font-poppins font-medium overflow-hidden whitespace-nowrap text-ellipsis"
                >
                    {activeTab === 'Series' && `${capitalize(card.serieName)} Series`}
                    {activeTab === 'Authors' && (card.nickname ? capitalize(card.nickname) : capitalize(card.authorName))}
                    {activeTab === 'Collections' && capitalize(card.collectionName)}
                </p>
                {activeTab === 'Series' ? (
                    <>
                        <p
                            className='text-sm font-arima overflow-hidden whitespace-nowrap text-ellipsis '
                        >
                            <span>by </span>
                            {card.authors.map(author => (
                                <span
                                    key={author.author_id}
                                    title={capitalize(author.author_name)}
                                    className='hover:underline cursor-pointer'
                                    onClick={(e) => navigateToAuthor(e, author)}
                                >
                                    {capitalize(author.nickname || author.author_name)}
                                </span>
                            )).reduce((prev, curr) => [prev, ', ', curr])}
                        </p>
                        <p className="font-arima font-bold text-xs text-green-700 mt-4">
                            {card.numBooks} books
                        </p>
                    </>
                ) : activeTab === 'Collections' ? (
                    <>
                        {card.author_id ? (
                            <p
                                className='text-sm font-arima overflow-hidden whitespace-nowrap text-ellipsis '
                            >
                                <span>by </span>
                                {card.authors.map(author => (
                                    <span
                                        key={author.author_id}
                                        title={capitalize(author.author_name)}
                                        className="hover:underline cursor-pointer"
                                        onClick={(e) => navigateToAuthor(e, author)}
                                    >
                                        {capitalize(author.nickname || author.author_name)}
                                    </span>
                                )).reduce((prev, curr) => [prev, ', ', curr])}
                            </p>
                        ) : (
                            <p className='mt-9'></p>
                        )}
                        <p className="font-arima font-bold text-xs text-green-700 mt-4">
                            {card.numBooks} books
                        </p>
                    </>
                ) : (
                    <>
                        <p className="font-arima text-sm leading-4">{capitalize(card.nationality)}</p>
                        <p className="font-arima font-bold text-xs text-green-700 mt-2">
                            about {card.numBooks} books
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default Card;
