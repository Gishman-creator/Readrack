import React, { useEffect, useState } from 'react';
import axiosUtils from '../../../utils/axiosUtils';
import { useSocket } from '../../../context/SocketContext';

function Banner() {
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState('');
    const socket = useSocket();

    useEffect(() => {
        // Make the initial API call to start the update process
        const startUpdate = async () => {
            try {
                const response = await axiosUtils('/api/validateAuthors', 'POST');
                console.log(response)
            } catch (error) {
                console.error('Error starting author update:', error);
                setMessage('Failed to start author update.');
            }
        };

        startUpdate();

        // Listen for progress updates from the WebSocket
        socket.on('progress', (data) => {
            setProgress(data);  // Update progress percentage
        });

        socket.on('validateMessage', (message) => {
            setMessage(message);  // Update progress percentage
        });

        // Clean up socket connection when the component unmounts
        return () => {
            socket.off('progress');
            socket.off('validateMessage');
        };
    }, [socket]);

    return (
        <div className="w-full p-2 bg-primary text-white text-center text-sm font-emibold">
            <p>{message ? message : `Author data validation in progress: ${progress}`}</p>
        </div>
    );
}

export default Banner;
