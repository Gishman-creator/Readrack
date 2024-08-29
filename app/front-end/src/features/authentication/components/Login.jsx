import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../slices/authSlice'; // Adjust the import path as needed
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for showing/hiding password
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(login({ email, password })).unwrap();
            navigate('/auth/verify-email'); // Redirect to dashboard on successful login
        } catch (err) {
            toast.error(err);
        }
    };

    return (
        <div className="w-full flex justify-center items-center h-fit">
            <div className="w-[90%] md:w-[28rem] px-10 py-9 bg-white rounded-lg shadow-md">
                <h2 className="text-xl w-full text-center font-semibold mb-2 mx-auto">Login to your account</h2>
                <p className='text-xs text-slate-500 text-center font-semibold mb-6'>Please enter your email and password to continue</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email address:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-[#fafcf8] focus:bg-white mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder='email'
                            required
                        />
                    </div>
                    <div className="mb-10">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password:</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"} // Toggle password visibility
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-[#fafcf8] focus:bg-white mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder='password'
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
                    <button
                        type="submit"
                        className={`block w-[70%] mx-auto py-2 px-4 bg-[#37643B] text-white font-bold rounded-md on-click-amzn ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Login'}
                    </button>
                    {/* {error && <p className="mt-4 text-red-500 text-xs text-center">{error}</p>} */}
                    {/* <div className='text-center text-xs font-medium mt-2'>
                        <p className='inline'>Don't have an account? </p>
                        <span
                            className='text-blue-400 underline cursor-pointer'
                            onClick={() => navigate('/auth/signup')}
                        >Create an account</span>
                    </div> */}
                </form>
            </div>
        </div>
    );
}

export default Login;
