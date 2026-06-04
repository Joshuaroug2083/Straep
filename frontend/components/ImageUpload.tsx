'use client';

import { useCallback, useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

interface ImageUploadProps {
  uploadType: 'product_image' | 'service_image' | 'brand_logo' | 'brand_cover' | 'post_image';
  onUploadComplete?: (data: {
    cloudinary_public_id: string;
    cloudinary_url: string;
    width?: number;
    height?: number;
  }) => void;
  maxSize?: number; // in MB
}

export function ImageUpload({ uploadType, onUploadComplete, maxSize = 5 }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [cloudinaryConfig, setCloudinaryConfig] = useState<any>(null);
  const [mediaId, setMediaId] = useState<string>('');

  // Get Cloudinary config and generate signature
  const generateSignature = useCallback(async (selectedFile: File) => {
    try {
      setError('');
      const response = await api.post('/api/v1/media/uploads/generate_signature/', {
        upload_type: uploadType,
        filename: selectedFile.name,
        file_size: selectedFile.size,
      });

      if (response.data.success) {
        setCloudinaryConfig(response.data.data);
        setMediaId(response.data.data.media_id);
        return response.data.data;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate signature');
    }
  }, [uploadType]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(selectedFile.type)) {
      setError('Only JPEG, PNG, WebP, and GIF files are supported');
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);

    // Generate signature
    await generateSignature(selectedFile);
  }, [maxSize, generateSignature]);

  const uploadToCloudinary = async () => {
    if (!file || !cloudinaryConfig) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', cloudinaryConfig.api_key);
      formData.append('timestamp', cloudinaryConfig.timestamp);
      formData.append('signature', cloudinaryConfig.signature);
      formData.append('cloud_name', cloudinaryConfig.cloud_name);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          const cloudinaryResponse = JSON.parse(xhr.responseText);

          // Mark upload as complete on our backend
          try {
            await api.post('/api/v1/media/uploads/upload_complete/', {
              media_id: mediaId,
              cloudinary_public_id: cloudinaryResponse.public_id,
              cloudinary_url: cloudinaryResponse.url,
              width: cloudinaryResponse.width,
              height: cloudinaryResponse.height,
              format: cloudinaryResponse.format,
            });
          } catch (err) {
            console.error('Failed to mark upload complete:', err);
          }

          setSuccess(true);
          onUploadComplete?.({
            cloudinary_public_id: cloudinaryResponse.public_id,
            cloudinary_url: cloudinaryResponse.url,
            width: cloudinaryResponse.width,
            height: cloudinaryResponse.height,
          });

          // Reset after delay
          setTimeout(() => {
            setFile(null);
            setPreview('');
            setSuccess(false);
            setUploadProgress(0);
          }, 2000);
        } else {
          const response = JSON.parse(xhr.responseText);
          setError(response.error?.message || 'Upload failed');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setError('Network error during upload');
        setUploading(false);
      });

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`;
      xhr.open('POST', uploadUrl, true);
      xhr.send(formData);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview('');
    setError('');
    setSuccess(false);
    setUploadProgress(0);
  };

  return (
    <div className="w-full">
      {/* File Input Area */}
      {!file && !success && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer bg-gray-50">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-700">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PNG, JPG, WebP, GIF up to {maxSize}MB</p>
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Preview and Upload */}
      {file && !success && (
        <div className="space-y-4">
          {preview && (
            <div className="relative inline-block w-full">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={uploadToCloudinary}
              disabled={uploading || uploadProgress > 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Image
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">{uploadProgress}%</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Upload successful!</p>
            <p className="text-sm">Your image has been uploaded.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !file && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
