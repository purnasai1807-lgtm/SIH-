import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../services/apiClient';

export const VerifyEmailPage: React.FC = () => {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email address...');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setMessage('This verification link is missing its token.');
      return;
    }
    apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
      .then(() => {
        setSuccess(true);
        setMessage('Your email has been verified. You can now sign in.');
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'This verification link is invalid or expired.'));
  }, [params]);

  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <h1 className="text-2xl font-extrabold text-slate-900">Email verification</h1>
      <p className={`mt-4 text-sm ${success ? 'text-emerald-700' : 'text-slate-600'}`}>{message}</p>
      <Link to="/" className="inline-block mt-8 text-sm font-semibold text-blue-600 hover:underline">
        Return home
      </Link>
    </div>
  );
};
