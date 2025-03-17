/**
 * Compresses an image from a URL or base64 string
 * @param src Image source URL or base64 string
 * @param maxWidth Maximum width of the compressed image
 * @param quality Compression quality (0-1)
 * @returns Promise resolving to compressed image data URL
 */
export async function compressImage(src: string, maxWidth = 800, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress the image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed image as data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Handle CORS issues
      img.crossOrigin = 'anonymous';
      img.src = src;
    });
  }
  