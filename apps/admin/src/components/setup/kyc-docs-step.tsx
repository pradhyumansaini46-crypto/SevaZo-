'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Camera,
  Image as ImageIcon,
  FolderOpen,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  X,
} from 'lucide-react';

export type DocType = 'pan' | 'gst' | 'fssai' | 'cheque';

export interface UploadedDoc {
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

export interface DocumentItemConfig {
  id: DocType;
  title: string;
  required: boolean;
  docNumberLabel?: string;
}

const DOCUMENT_CONFIGS: DocumentItemConfig[] = [
  {
    id: 'pan',
    title: 'Business / Owner PAN Card',
    required: true,
    docNumberLabel: 'PAN Number',
  },
  {
    id: 'gst',
    title: 'GST Certificate (GSTIN)',
    required: true,
    docNumberLabel: 'GSTIN',
  },
  {
    id: 'fssai',
    title: 'FSSAI Food Safety License',
    required: false,
    docNumberLabel: 'License Number',
  },
  {
    id: 'cheque',
    title: 'Cancelled Cheque / Bank Statement',
    required: true,
    docNumberLabel: 'Account Holder',
  },
];

export const KycDocsStep: React.FC<{
  onNext?: (docs: Record<DocType, UploadedDoc | null>) => void;
  onBack?: () => void;
}> = ({ onNext, onBack }) => {
  // Real state-driven file selection (null = unuploaded)
  const [docs, setDocs] = useState<Record<DocType, UploadedDoc | null>>({
    pan: null,
    gst: null,
    fssai: null,
    cheque: null,
  });

  // Active document being uploaded via modal
  const [activeDocType, setActiveDocType] = useState<DocType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3 separate hidden HTML5 file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const openUploadModal = (docType: DocType) => {
    setActiveDocType(docType);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveDocType(null);
  };

  // Trigger respective hidden inputs
  const handleTakePhotoClick = () => {
    cameraInputRef.current?.click();
  };

  const handleChooseFromGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleBrowseFilesClick = () => {
    fileInputRef.current?.click();
  };

  // Process file selection from any source
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeDocType) {
      const isImage = file.type.startsWith('image/');
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

      const newDoc: UploadedDoc = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
      };

      setDocs((prev) => ({
        ...prev,
        [activeDocType]: newDoc,
      }));

      // Close modal and show success toast
      closeModal();
      setToastMessage(`${DOCUMENT_CONFIGS.find((d) => d.id === activeDocType)?.title || 'Document'} attached successfully`);
    }

    // Reset input value
    e.target.value = '';
  };

  const activeDocConfig = DOCUMENT_CONFIGS.find((d) => d.id === activeDocType);

  return (
    <div className="w-full max-w-2xl mx-auto font-['Outfit',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gray-900 text-white rounded-2xl shadow-xl animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden HTML5 File Inputs with strict native triggers */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf"
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />

      {/* Section Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Verify your business documents
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload clear scanned copies (PDF, JPG, PNG up to 5 MB).
        </p>
      </div>

      {/* Document Cards List */}
      <div className="space-y-4">
        {DOCUMENT_CONFIGS.map((config) => {
          const uploadedDoc = docs[config.id];
          const isUploaded = uploadedDoc !== null;

          return (
            <div
              key={config.id}
              className={`p-5 rounded-2xl bg-white border transition-all duration-200 ${
                isUploaded ? 'border-gray-200 shadow-sm' : 'border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
              }`}
            >
              {/* Card Header Row */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{config.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">
                    {isUploaded
                      ? `Size: ${(uploadedDoc.size / (1024 * 1024)).toFixed(2)} MB`
                      : 'Document not yet uploaded'}
                  </p>
                </div>

                {/* Dynamic Status Badge */}
                {isUploaded ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    UPLOADED
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-full">
                    NOT UPLOADED
                  </span>
                )}
              </div>

              {/* Card Body: State-Driven View */}
              <div className="mt-4">
                {isUploaded ? (
                  /* Solid Border Uploaded File Preview */
                  <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-800 truncate max-w-xs sm:max-w-md">
                        {uploadedDoc.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openUploadModal(config.id)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline px-2 py-1 shrink-0 transition-colors"
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  /* Dashed Border Upload Trigger */
                  <button
                    type="button"
                    onClick={() => openUploadModal(config.id)}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-gray-50/50 hover:bg-gray-100/70 border-1.5 border-dashed border-gray-300 hover:border-emerald-500 rounded-xl active:scale-[0.99] transition-all text-sm font-semibold text-emerald-600 focus:outline-none"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload {config.id.toUpperCase()} Document</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Back
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={() => onNext(docs)}
            className="ml-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-sm active:scale-95 transition-all"
          >
            Save & Continue
          </button>
        )}
      </div>

      {/* 3-Option Bottom Sheet Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-[32px] shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-6 pt-3 pb-8 font-['Outfit',sans-serif] animate-in slide-in-from-bottom duration-300 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Drag Indicator */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

            {/* Modal Header */}
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Upload {activeDocConfig?.title || 'Document'}
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Choose a source to attach your verification document
              </p>
            </div>

            {/* 3 Action Options */}
            <div className="flex flex-col gap-3.5">
              {/* Option 1: Take Photo with Camera */}
              <button
                type="button"
                onClick={handleTakePhotoClick}
                className="flex items-center w-full p-4 bg-gray-50 hover:bg-gray-100/80 border border-gray-100 rounded-2xl active:scale-95 transition-transform duration-150 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Take Photo</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Use camera to capture physical document</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              </button>

              {/* Option 2: Choose from Photo Gallery */}
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
                  <p className="text-xs text-gray-500 mt-0.5">Select photo from your device library</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              </button>

              {/* Option 3: Browse Files (PDF/Docs) */}
              <button
                type="button"
                onClick={handleBrowseFilesClick}
                className="flex items-center w-full p-4 bg-gray-50 hover:bg-gray-100/80 border border-gray-100 rounded-2xl active:scale-95 transition-transform duration-150 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Browse Files (PDF)</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Select PDF or document from file explorer</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              </button>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={closeModal}
              className="w-full py-4 mt-5 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-800 font-semibold rounded-full text-center transition-all duration-150 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycDocsStep;
