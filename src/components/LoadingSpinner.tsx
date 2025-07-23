import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <svg className="animate-spin h-16 w-16 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" fill="none" />
      <path fill="currentColor" d="M4 12a8 8 0 1 1 8 8h-1a7 7 0 1 0-7-7V12z" />
    </svg>
  </div>
);
