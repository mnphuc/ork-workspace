"use client";
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      window.location.href = '/home';
    } else {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">OKR Management System</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}