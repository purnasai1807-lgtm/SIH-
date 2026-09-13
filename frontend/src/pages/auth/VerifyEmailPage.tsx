import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../services/apiClient';

export const VerifyEmailPage: React.FC = () => {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email address...');
  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setMessage('This verification link is missing its token.');
      return;
    }
    apiRequest<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((result) => setMessage(result.message))
      .catch((error) => setMessage(error instanceof Error ? error.message : 'This verification link is invalid or expired.'));
  }, [params]);
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Email verification</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
        <Link to="/borrower/signin" className="mt-6 inline-block text-sm font-semibold text-blue-600">Continue to sign in</Link>
      </div>
    </div>
  );
};
