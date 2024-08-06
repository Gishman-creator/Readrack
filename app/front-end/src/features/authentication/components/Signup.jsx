import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../slices/authSlice'; // Adjust the import path as needed
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // New state for showing/hiding password
    const role = 'admin';
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            await dispatch(signup({ firstName, lastName, email, password, role })).unwrap();
            alert('Account created successfully navigation to the login page');
            navigate('/auth/login');
        } catch (err) {
            // Handle error
        }
    };

    return (
        <div className="flex w-full justify-center items-center h-fit">
            <div className="w-[90%] md:w-[30rem] px-10 py-9 bg-white rounded-lg shadow-md">
                <h2 className="text-xl w-full text-center font-semibold mb-2 mx-auto">Create an account</h2>
                <form onSubmit={handleSubmit}>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className="mb-4">
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First name:</label>
                            <input
                                type="text"  // Corrected type
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="bg-[#fafcf8] focus:bg-white mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder="first name"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last name:</label>
                            <input
                                type="text"  // Corrected type
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="bg-[#fafcf8] focus:bg-white mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder="last name"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-[#fafcf8] focus:bg-white mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="email"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}  // Toggle password visibility
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-[#fafcf8] focus:bg-white mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder="password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-3"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-5 w-5 ${showPassword ? 'text-gray-500' : 'text-gray-400'}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={showPassword ? "M12 4.5C8.318 4.5 5.182 7.636 3.867 11.21a9.963 9.963 0 0 0 0 1.58C5.182 16.364 8.318 19.5 12 19.5s6.818-3.136 8.133-6.91a9.963 9.963 0 0 0 0-1.58C18.818 7.636 15.682 4.5 12 4.5zM12 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" : "M12 4.5C8.318 4.5 5.182 7.636 3.867 11.21a9.963 9.963 0 0 0 0 1.58C5.182 16.364 8.318 19.5 12 19.5s6.818-3.136 8.133-6.91a9.963 9.963 0 0 0 0-1.58C18.818 7.636 15.682 4.5 12 4.5zM12 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"}
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}  // Toggle visibility
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-[#fafcf8] focus:bg-white mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="confirm password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className={`block w-[70%] mx-auto py-2 px-4 bg-[#37643B] text-white font-bold rounded-md on-click-amzn ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Sign Up'}
                    </button>
                    {error && <p className="mt-4 text-red-500 text-xs text-center">{error}</p>}
                    <div className='text-center text-xs font-medium mt-2'>
                        <p className='inline'>Already have an account? </p>
                        <span
                            className='text-blue-400 underline cursor-pointer'
                            onClick={() => navigate('/auth/login')}
                        >Log in</span>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;
