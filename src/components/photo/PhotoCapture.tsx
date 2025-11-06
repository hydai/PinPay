import React, { useState } from 'react';
import { Photo } from '../../types/expense';
import { processPhoto, capturePhoto, selectPhoto } from '../../services/photo';
import { Button } from '../common/Button';

interface PhotoCaptureProps {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  maxPhotos?: number;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  photos,
  onChange,
  maxPhotos = 5,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleCapture = async () => {
    try {
      setUploading(true);
      const file = await capturePhoto();
      if (file) {
        const result = await processPhoto(file);
        if (result.success && result.photo) {
          onChange([...photos, result.photo]);
        } else {
          alert(result.error || '處理照片失敗');
        }
      }
    } catch (error) {
      console.error('拍照失敗:', error);
      alert('拍照失敗，請重試');
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = async () => {
    try {
      setUploading(true);
      const file = await selectPhoto();
      if (file) {
        const result = await processPhoto(file);
        if (result.success && result.photo) {
          onChange([...photos, result.photo]);
        } else {
          alert(result.error || '處理照片失敗');
        }
      }
    } catch (error) {
      console.error('選擇照片失敗:', error);
      alert('選擇照片失敗，請重試');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (photoId: string) => {
    onChange(photos.filter((p) => p.id !== photoId));
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        照片記錄（選填）
      </label>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square">
              <img
                src={photo.thumbnail || photo.data}
                alt="收據照片"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemove(photo.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {canAddMore && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCapture}
            disabled={uploading}
            className="flex-1"
          >
            📷 拍照
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelect}
            disabled={uploading}
            className="flex-1"
          >
            🖼️ 選擇照片
          </Button>
        </div>
      )}

      {!canAddMore && (
        <p className="text-sm text-gray-500 text-center">
          已達照片數量上限（{maxPhotos} 張）
        </p>
      )}

      {uploading && (
        <p className="text-sm text-gray-500 text-center mt-2">處理照片中...</p>
      )}
    </div>
  );
};
