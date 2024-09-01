// features/auth/VerifyEmail.jsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, resendCode, setLoginState  } from '../slices/authSlice'; // Adjust the import path as needed
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function VerifyEmail() {
    const [code, setCode] = useState(Array(6).fill('')); // Initialize an array of 6 empty strings
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error, email } = useSelector((state) => state.auth);

    // Function to obfuscate the email for display
    const obfuscateEmail = (email) => {
        const [localPart, domain] = email.split('@');
        const obfuscatedLocal = localPart.slice(0, 3) + '...';
        return `${obfuscatedLocal}@${domain}`;
    };

    // Handle change for individual digit inputs
    const handleChange = (e, index) => {
        const input = e.target.value;
        const newCode = [...code];
        if (input.length > 1) {
            // Handle pasting a string of digits
            input.split('').forEach((digit, i) => {
                if (index + i < 6) {
                    newCode[index + i] = digit;
                }
            });
            setCode(newCode);

            // Focus the next empty input box or the last one if the input fills all
            const nextIndex = Math.min(index + input.length, 5);
            document.getElementById(`digit-${nextIndex}`).focus();
        } else {
            // Handle normal input
            newCode[index] = input.slice(-1); // Ensure only the last digit is taken
            setCode(newCode);

            // Move focus to the next input if not the last one and current input is not empty
            if (newCode[index] && index < 5) {
                document.getElementById(`digit-${index + 1}`).focus();
            }
        }
    };

    // Handle backspace navigation between inputs
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            // Move focus to the previous input if backspace is pressed on an empty box
            document.getElementById(`digit-${index - 1}`).focus();
        }
    };

    // Handle paste event for multiple digits
    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        const newCode = [...code];
        paste.split('').forEach((digit, i) => {
            if (i < 6) {
                newCode[i] = digit;
            }
        });
        setCode(newCode);

        // Focus the next empty input box or the last one if the input fills all
        const nextIndex = Math.min(paste.length, 5);
        document.getElementById(`digit-${nextIndex}`).focus();

        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode = code.join('');
    
        try {
            const action = await dispatch(verifyEmail({ email, code: fullCode }));
            if (verifyEmail.fulfilled.match(action)) {
                const { accessToken, refreshToken } = action.payload;
                if ( accessToken ) {
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    localStorage.setItem('userEmail', email);
                    // console.log('Stored accessToken:', accessToken);
    
                    toast.success('Email verified successfully!');
                    dispatch(setLoginState(true));
                    navigate('/admin');
                } else {
                    console.error('Access token is missing in response:', action.payload);
                }
            } else {
                console.error('Verification failed:', action.payload);
            }
        } catch (err) {
            console.error(err);
        }
    };
    

    // Handle resend code request
    const handleResendCode = async () => {
        try {
            await dispatch(resendCode()).unwrap();
            toast.success('Verification code resent!');
        } catch (err) {
            // Handle error
            toast.error(err);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#f6f9f2]">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-center text-2xl font-semibold mb-2">Check your email</h2>
                <div className='text-center text-xs mt-2 mb-4'>
                    <p className='inline font-semibold text-xs text-slate-500'>Enter the 6 digit code sent to your email </p>
                    <p className='inline font-bold'>{obfuscateEmail(email)}</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 flex justify-between">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                id={`digit-${index}`}
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onPaste={handlePaste}
                                className="w-12 h-12 text-center border border-gray-300 rounded-md shadow-sm"
                                maxLength="1"
                                required
                            />
                        ))}
                    </div>
                    <button
                        type="submit"
                        className={`w-full py-2 px-4 bg-green-600 text-white font-bold rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Verify'}
                    </button>
                    {error && <p className="mt-4 text-red-500 text-xs text-center">{error}</p>}
                    <div className='text-center text-xs mt-2'>
                        <p className='inline'>Didn't get the code? </p>
                        <span
                            className='font-bold cursor-pointer'
                            onClick={handleResendCode}
                        >Resend</span>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default VerifyEmail;
