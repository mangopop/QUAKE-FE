import React from 'react';

export default function LoadingText() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg flex items-center justify-center relative overflow-hidden">
          <svg className="w-8 h-8 text-transparent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <svg
            className="w-8 h-8 absolute top-0 left-0 bg-gradient-to-t from-purple-500 via-blue-500 to-transparent bg-clip-text text-transparent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              backgroundSize: '100% 200%',
              backgroundPosition: '0% 0%',
              animation: 'fillUp 2s ease-out forwards'
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="relative overflow-hidden">
          <h1 className="text-7xl font-bold text-transparent">UATOPIA</h1>
          <h1
            className="text-7xl font-bold absolute top-0 left-0 bg-gradient-to-t from-purple-500 via-blue-500 to-transparent bg-clip-text text-transparent"
            style={{
              backgroundSize: '100% 200%',
              backgroundPosition: '0% 0%',
              animation: 'fillUp 2s ease-out forwards'
            }}
          >
            UATOPIA
          </h1>
        </div>
      </div>
      <style>
        {`
          @keyframes fillUp {
            from {
              background-position: 0% 0%;
            }
            to {
              background-position: 100% 100%;
            }
          }
        `}
      </style>
    </div>
  );
}