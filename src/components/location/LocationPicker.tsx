import React, { useState } from 'react';
import { Location } from '../../types/expense';
import { getCurrentLocation, parseGoogleMapsUrl, generateGoogleMapsUrl } from '../../services/location';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface LocationPickerProps {
  location: Location | undefined;
  onChange: (location: Location | undefined) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const result = await getCurrentLocation();
      if (result.success && result.location) {
        onChange(result.location);
        alert('定位成功！');
      } else {
        alert(result.error || '定位失敗');
      }
    } catch (error) {
      console.error('定位錯誤:', error);
      alert('定位失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleParseUrl = async () => {
    if (!urlInput.trim()) {
      alert('請輸入 Google Maps 連結');
      return;
    }

    setLoading(true);
    try {
      const result = await parseGoogleMapsUrl(urlInput);
      if (result.success && result.location) {
        onChange(result.location);
        setUrlInput('');
        setShowUrlInput(false);
        alert('解析成功！');
      } else {
        alert(result.error || '解析失敗');
      }
    } catch (error) {
      console.error('解析錯誤:', error);
      alert('解析失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLocation = () => {
    onChange(undefined);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        位置記錄（選填）
      </label>

      {location ? (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📍</span>
                <span className="font-medium text-gray-900">已記錄位置</span>
              </div>
              <p className="text-sm text-gray-600">
                {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveLocation}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              移除
            </button>
          </div>

          {location.googleMapsUrl ? (
            <a
              href={location.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 text-sm hover:underline inline-flex items-center gap-1"
            >
              在 Google Maps 中查看 →
            </a>
          ) : (
            <a
              href={generateGoogleMapsUrl(location.latitude, location.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 text-sm hover:underline inline-flex items-center gap-1"
            >
              在 Google Maps 中查看 →
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGetCurrentLocation}
              loading={loading}
              className="flex-1"
            >
              📍 使用 GPS 定位
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex-1"
            >
              🔗 Google Maps 連結
            </Button>
          </div>

          {showUrlInput && (
            <div className="space-y-2">
              <Input
                type="url"
                placeholder="貼上 Google Maps 分享連結"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleParseUrl}
                  loading={loading}
                  className="flex-1"
                >
                  解析位置
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowUrlInput(false);
                    setUrlInput('');
                  }}
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
