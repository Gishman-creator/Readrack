import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../utils/axiosUtils';
import { useSocket } from '../../../context/SocketContext';

function Banner() {
    const [validateMessage, setValidateMessage] = useState('');
    const [ratingMessage, setRatingMessage] = useState('');
    const [validateAuthorProgress, setValidateAuthorProgress] = useState('');
    const [authorRatingsProgress, setAuthorRatingsProgress] = useState('');
    const socket = useSocket();

    useEffect(() => {
        // Make the initial API call to start the update process
        const startUpdate = async () => {
            try {
                // const validateAuthorsResponse = await axiosUtils('/api/validateAuthors', 'POST');
                // console.log('Validate authors response:', validateAuthorsResponse);

                const updateAuthorRatingsResponse = await axiosUtils('/api/updateAuthorRatings', 'POST');
                console.log('Update author ratings response:', updateAuthorRatingsResponse);
            } catch (error) {
                console.error('Error starting author update:', error);
            }
        };

        startUpdate();

        // Listen for progress updates from the WebSocket
        // socket.on('validateAuthorProgress', (data) => {
        //     setValidateAuthorProgress(data);  // Update progress percentage
        // });

        // socket.on('validateMessage', (message) => {
        //     setValidateMessage(message);  // Update progress percentage
        // });

        // Listen for progress updates from the WebSocket
        socket.on('authorRatingsProgress', (data) => {
            setAuthorRatingsProgress(data);  // Update progress percentage
        });

        socket.on('ratingMessage', (message) => {
            setRatingMessage(message);  // Update progress percentage
        });

        // Clean up socket connection when the component unmounts
        return () => {
            socket.off('validateAuthorProgress');
            socket.off('validateMessage');
            socket.off('authorRatingsProgress');
            socket.off('ratingMessage');
        };
    }, [socket]);

    return (
        <div className="flex justify-evenly w-full p-2 bg-primary text-white text-center text-sm font-emibold">
            {/* <span>{validateMessage ? validateMessage : `Author validation: ${validateAuthorProgress}`}</span> */}
            <span>{ratingMessage ? ratingMessage : `Author rating: ${authorRatingsProgress}`}</span>
        </div>
    );
}

export default Banner;
