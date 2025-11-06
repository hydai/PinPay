import { Location } from '../types/expense';

export interface GeolocationResult {
  success: boolean;
  location?: Location;
  error?: string;
}

/**
 * 獲取當前 GPS 位置
 */
export const getCurrentLocation = (): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: '您的瀏覽器不支援定位功能',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // 嘗試反向地理編碼獲取地址（可選）
        const address = await reverseGeocode(latitude, longitude);

        resolve({
          success: true,
          location: {
            latitude,
            longitude,
            address,
          },
        });
      },
      (error) => {
        let errorMessage = '無法獲取位置';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '您拒絕了定位權限請求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置資訊無法使用';
            break;
          case error.TIMEOUT:
            errorMessage = '定位請求超時';
            break;
        }

        resolve({
          success: false,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * 解析 Google Maps 分享連結
 * 支援的格式:
 * - https://maps.google.com/?q=25.0330,121.5654
 * - https://goo.gl/maps/xxxxx
 * - https://www.google.com/maps/place/.../@25.0330,121.5654
 * - https://maps.app.goo.gl/xxxxx
 */
export const parseGoogleMapsUrl = async (url: string): Promise<GeolocationResult> => {
  try {
    // 處理短網址（需要展開）
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      // 在實際應用中，可能需要通過 API 展開短網址
      // 這裡提供基本的錯誤提示
      return {
        success: false,
        error: '請使用完整的 Google Maps 連結，或先在瀏覽器中打開短網址後複製完整連結',
      };
    }

    // 解析 ?q= 格式
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qMatch) {
      const latitude = parseFloat(qMatch[1]);
      const longitude = parseFloat(qMatch[2]);

      if (isValidCoordinate(latitude, longitude)) {
        const address = await reverseGeocode(latitude, longitude);
        return {
          success: true,
          location: {
            latitude,
            longitude,
            address,
            googleMapsUrl: url,
          },
        };
      }
    }

    // 解析 @lat,lng 格式
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      const latitude = parseFloat(atMatch[1]);
      const longitude = parseFloat(atMatch[2]);

      if (isValidCoordinate(latitude, longitude)) {
        const address = await reverseGeocode(latitude, longitude);
        return {
          success: true,
          location: {
            latitude,
            longitude,
            address,
            googleMapsUrl: url,
          },
        };
      }
    }

    // 解析 ll= 格式（某些地圖連結使用）
    const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (llMatch) {
      const latitude = parseFloat(llMatch[1]);
      const longitude = parseFloat(llMatch[2]);

      if (isValidCoordinate(latitude, longitude)) {
        const address = await reverseGeocode(latitude, longitude);
        return {
          success: true,
          location: {
            latitude,
            longitude,
            address,
            googleMapsUrl: url,
          },
        };
      }
    }

    return {
      success: false,
      error: '無法從連結中解析出座標，請確認連結格式是否正確',
    };
  } catch (error) {
    return {
      success: false,
      error: '解析 Google Maps 連結時發生錯誤',
    };
  }
};

/**
 * 驗證座標是否有效
 */
const isValidCoordinate = (lat: number, lng: number): boolean => {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * 反向地理編碼（座標轉地址）
 * 注意：這需要 Google Maps API key，目前返回簡化的座標字串
 * 未來可以整合 Google Maps Geocoding API
 */
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  // TODO: 整合 Google Maps Geocoding API
  // 暫時返回座標字串
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * 生成 Google Maps 連結
 */
export const generateGoogleMapsUrl = (latitude: number, longitude: number): string => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

/**
 * 計算兩個座標之間的距離（公里）
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // 地球半徑（公里）
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};
