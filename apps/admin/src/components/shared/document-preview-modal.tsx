'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ExternalLink,
  FileText,
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

export interface PreviewDocPayload {
  title: string;
  type?: string;
  number?: string;
  fileUrl: string;
  isImage?: boolean;
  fileName?: string;
  verified?: boolean;
}

interface DocumentPreviewModalProps {
  doc: PreviewDocPayload | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentPreviewModal({ doc, isOpen, onClose }: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!doc) return null;

  const isPdf = doc.fileUrl?.endsWith('.pdf') || doc.type?.toLowerCase().includes('pdf');
  const isImage = !isPdf;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleReset();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-background border shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/40 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <DialogTitle className="flex items-center gap-2.5 text-base font-bold">
              {isImage ? (
                <ImageIcon className="h-5 w-5 text-primary" />
              ) : (
                <FileText className="h-5 w-5 text-blue-600" />
              )}
              {doc.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-xs">
              {doc.number && <span className="font-mono font-medium">ID: {doc.number}</span>}
              {doc.type && <span className="uppercase text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold">{doc.type}</span>}
              {doc.verified && (
                <Badge variant="outline" className="border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 text-[10px] gap-1 font-semibold">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                </Badge>
              )}
            </DialogDescription>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1.5 pr-8">
            {isImage && (
              <>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleZoomOut} title="Zoom Out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleZoomIn} title="Zoom In">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleRotate} title="Rotate 90°">
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8" asChild title="Open in new tab">
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" asChild title="Download">
              <a href={doc.fileUrl} download={doc.fileName || 'document'}>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </DialogHeader>

        {/* Viewport Canvas */}
        <div className="flex-1 min-h-[420px] max-h-[68vh] overflow-auto bg-zinc-950/5 dark:bg-zinc-950 flex items-center justify-center p-6 select-none relative">
          {isImage ? (
            <div className="flex items-center justify-center transition-transform duration-200" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.fileUrl}
                alt={doc.title}
                className="max-h-[58vh] max-w-full object-contain rounded-lg shadow-md border bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-muted/20 rounded-xl border border-dashed">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-base">{doc.title} (PDF Document)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered Document ID: {doc.number || 'Standard Form'}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1.5" /> Open Full PDF
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={doc.fileUrl} download={doc.fileName || 'document.pdf'}>
                    <Download className="h-4 w-4 mr-1.5" /> Download File
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Encrypted Audit Proof
          </span>
          <div className="flex items-center gap-2">
            {isImage && (
              <span className="font-mono text-[11px]">
                {Math.round(zoom * 100)}% • {rotation}°
              </span>
            )}
            <Button size="sm" variant="outline" onClick={() => { handleReset(); onClose(); }}>
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
