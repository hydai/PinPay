import { Photo } from '../types/expense';

export interface PhotoProcessResult {
  success: boolean;
  photo?: Photo;
  error?: string;
}

/**
 * 處理上傳的照片（壓縮並轉換為 Base64）
 */
export const processPhoto = async (file: File): Promise<PhotoProcessResult> => {
  try {
    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '請選擇圖片文件',
      };
    }

    // 檢查文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: '圖片文件過大，請選擇小於 10MB 的圖片',
      };
    }

    // 壓縮圖片
    const compressedImage = await compressImage(file, 1920, 1080, 0.8);
    const thumbnail = await compressImage(file, 200, 200, 0.6);

    const photo: Photo = {
      id: generatePhotoId(),
      data: compressedImage,
      thumbnail,
      timestamp: new Date(),
    };

    return {
      success: true,
      photo,
    };
  } catch (error) {
    return {
      success: false,
      error: '處理圖片時發生錯誤',
    };
  }
};

/**
 * 壓縮圖片
 */
const compressImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 計算縮放比例
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('無法獲取 canvas context'));
          return;
        }

        // 繪製圖片
        ctx.drawImage(img, 0, 0, width, height);

        // 轉換為 Base64
        // 優先使用 WebP 格式（如果支援）
        const format = canvas.toDataURL('image/webp').startsWith('data:image/webp')
          ? 'image/webp'
          : 'image/jpeg';

        const base64 = canvas.toDataURL(format, quality);
        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error('圖片載入失敗'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('文件讀取失敗'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * 從相機拍攝照片（移動端）
 */
export const capturePhoto = (): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // 使用後置相機

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      resolve(file || null);
    };

    input.oncancel = () => {
      resolve(null);
    };

    input.click();
  });
};

/**
 * 從圖庫選擇照片
 */
export const selectPhoto = (): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      resolve(file || null);
    };

    input.oncancel = () => {
      resolve(null);
    };

    input.click();
  });
};

/**
 * 選擇多張照片
 */
export const selectMultiplePhotos = (): Promise<FileList | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      resolve(files);
    };

    input.oncancel = () => {
      resolve(null);
    };

    input.click();
  });
};

/**
 * 生成照片 ID
 */
const generatePhotoId = (): string => {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 計算圖片大小（Base64）
 */
export const calculateBase64Size = (base64: string): number => {
  const base64Length = base64.length - (base64.indexOf(',') + 1);
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return (base64Length * 3) / 4 - padding;
};

/**
 * 格式化圖片大小
 */
export const formatPhotoSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
