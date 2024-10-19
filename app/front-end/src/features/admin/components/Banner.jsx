import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../utils/axiosUtils';
import { useSocket } from '../../../context/SocketContext';

function Banner() {
    const [scrapeBookSeriesMessage, setScrapeBookSeriesMessage] = useState('');
    const [scrapeSeriesBooksMessage, setScrapeSeriesBooksMessage] = useState('');
    const [scrapeSeriesMessage, setScrapeSeriesMessage] = useState('');
    const [ratingMessage, setRatingMessage] = useState('');
    const [validateAuthorMessage, setValidateAuthorMessage] = useState('');
    const [scrapeBookSeriesProgress, setScrapeBookSeriesProgress] = useState('');
    const [scrapeSeriesBooksProgress, setScrapeSeriesBooksProgress] = useState('');
    const [scrapeSeriesProgress, setScrapeSeriesProgress] = useState('');
    const [authorRatingsProgress, setAuthorRatingsProgress] = useState('');
    const [validateAuthorProgress, setValidateAuthorProgress] = useState('');
    const socket = useSocket();

    useEffect(() => {
        // Make the initial API call to start the update process
        const startUpdate = async () => {
            try {
                // const validateAuthorResponse = await axiosUtils('/api/validateAuthors', 'POST');
                // console.log('Validate authors response:', validateAuthorResponse);

                // const scrapeBookSeriesInOrderResponse = await axiosUtils('/api/scrapeBookSeriesInOrder', 'POST');
                // console.log('Validate authors response:', scrapeBookSeriesInOrderResponse);

                // const scrapeSeriesResponse = await axiosUtils('/api/scrapeSeries', 'POST');
                // console.log('Validate authors response:', scrapeSeriesResponse);

                const scrapeSeriesBooksResponse = await axiosUtils('/api/scrapeSeriesBooks', 'POST');
                console.log('Validate authors response:', scrapeSeriesBooksResponse);

                // const updateAuthorRatingsResponse = await axiosUtils('/api/updateAuthorRatings', 'POST');
                // console.log('Update author ratings response:', updateAuthorRatingsResponse);
            } catch (error) {
                console.error('Error starting author update:', error);
            }
        };

        startUpdate();

        // Listen for progress updates from the WebSocket
        // socket.on('validateAuthorProgress', (data) => {
        //     setValidateAuthorProgress(data);  // Update progress percentage
        // });

        // socket.on('validateAuthorMessage', (message) => {
        //     setValidateAuthorMessage(message);  // Update progress percentage
        // });

        // Listen for progress updates from the WebSocket
        // socket.on('scrapeSeriesProgress', (data) => {
        //     setScrapeSeriesProgress(data);  // Update progress percentage
        // });

        // socket.on('scrapeSeriesMessage', (message) => {
        //     setScrapeSeriesMessage(message);  // Update progress percentage
        // });

        // Listen for progress updates from the WebSocket
        socket.on('scrapeSeriesBooksProgress', (data) => {
            setScrapeSeriesBooksProgress(data);  // Update progress percentage
        });

        socket.on('scrapeSeriesBooksMessage', (message) => {
            setScrapeSeriesBooksMessage(message);  // Update progress percentage
        });

        // Listen for progress updates from the WebSocket
        // socket.on('scrapeBookSeriesProgress', (data) => {
        //     setScrapeBookSeriesProgress(data);  // Update progress percentage
        // });

        // socket.on('scrapeBookSeriesMessage', (message) => {
        //     setScrapeBookSeriesMessage(message);  // Update progress percentage
        // });

        // Listen for progress updates from the WebSocket
        // socket.on('authorRatingsProgress', (data) => {
        //     setAuthorRatingsProgress(data);  // Update progress percentage
        // });

        // socket.on('ratingMessage', (message) => {
        //     setRatingMessage(message);  // Update progress percentage
        // });

        // Clean up socket connection when the component unmounts
        return () => {
            socket.off('validateAuthorProgress');
            socket.off('validateAuthorMessage');
            socket.off('scrapeSeriesBooksProgress');
            socket.off('scrapeSeriesBooksMessage');
            socket.off('scrapeSeriesProgress');
            socket.off('scrapeSeriesMessage');
            socket.off('scrapeBookSeriesProgress');
            socket.off('scrapeBookSeriesMessage');
            socket.off('authorRatingsProgress');
            socket.off('ratingMessage');
        };
    }, [socket]);

    return (
        <div className="flex justify-evenly w-full p-2 bg-primary text-white text-center text-sm font-emibold">
            {/* <span>{validateAuthorMessage ? validateAuthorMessage : `Author validation running: ${validateAuthorProgress}`}</span> */}
            <span>{scrapeSeriesBooksMessage ? scrapeSeriesBooksMessage : `Series books scraping running: ${scrapeSeriesBooksProgress}`}</span>
            {/* <span>{scrapeSeriesMessage ? scrapeSeriesMessage : `Series scraping running: ${scrapeSeriesProgress}`}</span> */}
            {/* <span>{scrapeBookSeriesMessage ? scrapeBookSeriesMessage : `Author bookseriesinorder scraping running: ${scrapeBookSeriesProgress}`}</span> */}
            {/* <span>{ratingMessage ? ratingMessage : `Author rating: ${authorRatingsProgress}`}</span> */}
        </div>
    );
}

export default Banner;
