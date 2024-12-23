"use client";

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

export default function GiveawayResults() {
  const { user } = useUser();
  const { userId } = useAuth();
  const [code, setCode] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Get user's phone number from Clerk on component mount
  useEffect(() => {
    if (user) {
      // Get primary phone number from Clerk user
      const primaryPhone = user.primaryPhoneNumber?.phoneNumber;
      if (primaryPhone) {
        setPhoneNumber(primaryPhone);
      }
    }
  }, [user]);

  // Check if user has already submitted a code
  useEffect(() => {
    if (phoneNumber) {
      const submissions = JSON.parse(localStorage.getItem('codeSubmissions') || '{}');
      if (submissions[phoneNumber]) {
        setHasSubmitted(true);
        setIsValid(true);
        setCode(submissions[phoneNumber]);
      }
    }
  }, [phoneNumber]);

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('No phone number associated with your account');
      return;
    }

    // Check if user has already submitted
    const submissions = JSON.parse(localStorage.getItem('codeSubmissions') || '{}');
    if (submissions[phoneNumber]) {
      setError('You have already submitted a code');
      return;
    }

    // Validate code
    const validCodes = ['CODE123', 'CODE456', 'CODE789'];
    if (validCodes.includes(code)) {
      // Save submission
      submissions[phoneNumber] = code;
      localStorage.setItem('codeSubmissions', JSON.stringify(submissions));
      setIsValid(true);
      setHasSubmitted(true);
    } else {
      setIsValid(false);
    }
  };

  if (!userId) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className='text-2xl font-bold mb-5'>Giveaway Results</h1>
        <p>Please sign in to participate in the giveaway.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className='text-2xl font-bold mb-5'>Giveaway Results</h1>
      
      {phoneNumber ? (
        <p className="mb-4">Participating with phone: {phoneNumber}</p>
      ) : (
        <p className="mb-4 text-red-500">Please add a phone number to your Clerk account to participate.</p>
      )}

      {hasSubmitted ? (
        <div className='mb-5'>
          <p className='text-green-600 font-semibold'>
            You have already submitted code: {code}
          </p>
          <p>Thank you for participating!</p>
        </div>
      ) : phoneNumber && isValid === null ? (
        <form onSubmit={handleCodeSubmit} className='space-y-4'>
          <div>
            <label htmlFor='code' className='block mb-2'>
              Enter your label code:
            </label>
            <input
              type='text'
              id='code'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className='border p-2 w-full rounded'
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button type='submit' className='bg-blue-500 text-white p-2 rounded w-full'>
            Submit
          </button>
        </form>
      ) : isValid ? (
        <div className='mb-5'>
          <p className='text-green-600 font-semibold'>
            Congratulations! Your code has been verified.
          </p>
          <p>Thank you for participating!</p>
        </div>
      ) : (
        <div className='mb-5'>
          <p className='text-red-500'>Invalid code. Please try again.</p>
          <button 
            onClick={() => setIsValid(null)}
            className='text-blue-500 hover:text-blue-700 mt-2'
          >
            Try Another Code
          </button>
        </div>
      )}
    </div>
  );
}