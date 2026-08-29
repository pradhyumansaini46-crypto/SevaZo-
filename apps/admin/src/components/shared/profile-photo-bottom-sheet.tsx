'use client';

import React, { useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, ChevronRight } from 'lucide-react';

export interface ProfilePhotoBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected?: (file: File, previewUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export const ProfilePhotoBottomSheet: React.FC<ProfilePhotoBottomSheetProps> = ({
  isOpen,
  onClose,
  onImageSelected,
  title = 'Upload Profile Photo',
  subtitle = 'Choose how you would like to upload your photo',
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Trigger hidden camera file input
  const handleTakePhotoClick = () => {
    cameraInputRef.current?.click();
  };

  // Trigger hidden gallery file input
  const handleChooseFromGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  // Process selected file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onImageSelected?.(file, previewUrl);
      onClose();
    }
    // Reset value so selecting the same image triggers change
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Hidden HTML5 File Inputs with strict native triggers */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {/* Bottom Sheet Container */}
      <div
        className="w-full max-w-lg bg-white rounded-t-[32px] shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-6 pt-3 pb-8 font-['Outfit',sans-serif] animate-in slide-in-from-bottom duration-300 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Indicator */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">{subtitle}</p>
        </div>

        {/* Action Option Cards */}
        <div className="flex flex-col gap-3.5">
          {/* Option 1: Take Photo with Native Camera */}
          <button
            type="button"
            onClick={handleTakePhotoClick}
            className="flex items-center w-full p-4 bg-gray-50 hover:bg-gray-100/80 border border-gray-100 rounded-2xl active:scale-95 transition-transform duration-150 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-base font-semibold text-gray-900">Take Photo</h3>
              <p className="text-xs text-gray-500 mt-0.5">Use your phone camera to click a new picture</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
          </button>

          {/* Option 2: Choose from Native Device Gallery */}
          <button
            type="button"
            onClick={handleChooseFromGalleryClick}
            className="flex items-center w-full p-4 bg-gray-50 hover:bg-gray-100/80 border border-gray-100 rounded-2xl active:scale-95 transition-transform duration-150 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-base font-semibold text-gray-900">Choose from Gallery</h3>
              <p className="text-xs text-gray-500 mt-0.5">Select an existing photo from your device gallery</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
          </button>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 mt-5 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-800 font-semibold rounded-full text-center transition-all duration-150 focus:outline-none"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProfilePhotoBottomSheet;
