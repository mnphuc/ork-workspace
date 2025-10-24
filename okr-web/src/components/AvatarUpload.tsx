"use client";
import React, { useState, useRef } from 'react';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

export function AvatarUpload({ 
  currentAvatar, 
  onUpload, 
  onRemove,
  loading = false,
  className = "" 
}: AvatarUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    onUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    // Clear the input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Cleanup file input on component unmount
  React.useEffect(() => {
    return () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
  }, []);

  // Handle escape key to close file chooser and cleanup on unmount
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fileInputRef.current) {
        // Reset the file input
        if (fileInputRef.current.files) {
          fileInputRef.current.value = '';
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // If clicking outside the file input area, reset it
      if (fileInputRef.current && !fileInputRef.current.contains(e.target as Node)) {
        fileInputRef.current.value = '';
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
      // Cleanup file input on unmount
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
  }, []);

  const handleRemove = async () => {
    if (confirm('Are you sure you want to remove your avatar?')) {
      setPreview(null);
      await onRemove();
    }
  };

  const displayAvatar = preview || currentAvatar;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
              <span className="text-2xl text-gray-500">👤</span>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
          <p className="text-sm text-gray-500">
            Upload a new image or remove the current one
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="text-center">
          <div className="text-4xl mb-4">📷</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {dragActive ? 'Drop your image here' : 'Upload a new avatar'}
          </h4>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop an image here, or click to select
          </p>
          
          <button
            onClick={handleClick}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Choose File
          </button>
        </div>
      </div>

      {/* File Requirements */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-2">File Requirements</h5>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Supported formats: JPG, PNG, GIF, WebP</li>
          <li>• Maximum file size: 5MB</li>
          <li>• Recommended size: 200x200 pixels or larger</li>
          <li>• Square images work best</li>
        </ul>
      </div>

      {/* Actions */}
      {displayAvatar && (
        <div className="flex space-x-3">
          <button
            onClick={handleClick}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Change Avatar
          </button>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove Avatar
          </button>
        </div>
      )}

      {/* Preview */}
      {preview && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-green-600">✅</div>
            <div className="text-sm text-green-800">
              Image uploaded successfully! Click save to apply changes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
