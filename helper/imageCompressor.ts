import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

// Configuration constants
export const IMAGE_COMPRESSION_CONFIG = {
  MAX_FILE_SIZE: 1 * 1024 * 1024, // 1MB in bytes
  ALLOWED_TYPES: ["jpeg", "jpg", "png", "webp"],
  COMPRESSION_QUALITY: 0.7,
  MAX_DIMENSIONS: { width: 800, height: 800 },
  FIRESTORE_LIMIT: 800 * 1024, // 800KB for Firestore
} as const;

export interface ImageValidationResult {
  isValid: boolean;
  invalidSize?: boolean;
  error?: string;
  fileSize?: number;
  fileExtension?: string;
}

export interface CompressionResult {
  success: boolean;
  compressedUri?: string;
  base64?: string;
  originalSize?: number;
  compressedSize?: number;
  error?: string;
}

export interface CompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: ImageManipulator.SaveFormat;
  returnBase64?: boolean;
}

/**
 * Validate image file type and size
 * @param imageUri - URI of the image to validate
 * @returns Promise<ImageValidationResult> - Validation result
 */
export const validateImage = async (
  imageUri: string
): Promise<ImageValidationResult> => {
  try {
    // Get file info with size option
    const fileInfo = await FileSystem.getInfoAsync(imageUri, { size: true });

    if (!fileInfo.exists) {
      return { isValid: false, error: "Image file does not exist" };
    }

    // Check file size (only available when exists is true and size option is used)
    if (
      "size" in fileInfo &&
      fileInfo.size &&
      fileInfo.size > IMAGE_COMPRESSION_CONFIG.MAX_FILE_SIZE
    ) {
      return {
        isValid: false,
        invalidSize: true,
        error: `Image size (${Math.round(
          fileInfo.size / 1024
        )}KB) exceeds maximum allowed size of ${
          IMAGE_COMPRESSION_CONFIG.MAX_FILE_SIZE / 1024
        }KB`,
        fileSize: fileInfo.size,
      };
    }

    // Check file extension/type
    const fileExtension = imageUri.split(".").pop()?.toLowerCase();
    if (
      !fileExtension ||
      !IMAGE_COMPRESSION_CONFIG.ALLOWED_TYPES.includes(fileExtension as any)
    ) {
      return {
        isValid: false,
        error: `Invalid image type '${fileExtension}'. Allowed types: ${IMAGE_COMPRESSION_CONFIG.ALLOWED_TYPES.join(
          ", "
        )}`,
        fileExtension,
      };
    }

    return {
      isValid: true,
      fileSize: "size" in fileInfo ? fileInfo.size : undefined,
      fileExtension,
    };
  } catch (error) {
    console.error("Image validation error:", error);
    return { isValid: false, error: "Failed to validate image" };
  }
};

/**
 * Convert image URI to base64 with data URL prefix
 * @param imageUri - URI of the image to convert
 * @param format - Image format for data URL prefix
 * @returns Promise<string> - Base64 string with data URL prefix
 */
export const imageToBase64 = async (
  imageUri: string,
  format: "jpeg" | "png" | "webp" = "jpeg"
): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/${format};base64,${base64}`;
  } catch (error) {
    throw new Error("Failed to convert image to base64");
  }
};

/**
 * Get the byte size of a base64 string
 * @param base64String - Base64 string to measure
 * @returns number - Size in bytes
 */
export const getBase64Size = (base64String: string): number => {
  return new Blob([base64String]).size;
};

/**
 * Validate base64 string size for storage limits
 * @param base64String - Base64 string to validate
 * @param limit - Size limit in bytes (default: Firestore limit)
 * @returns ImageValidationResult - Validation result
 */
export const validateBase64Size = (
  base64String: string,
  limit: number = IMAGE_COMPRESSION_CONFIG.FIRESTORE_LIMIT
): ImageValidationResult => {
  const sizeInBytes = getBase64Size(base64String);

  if (sizeInBytes > limit) {
    return {
      isValid: false,
      error: `Compressed image (${Math.round(
        sizeInBytes / 1024
      )}KB) exceeds storage limit of ${Math.round(limit / 1024)}KB`,
      fileSize: sizeInBytes,
    };
  }

  return { isValid: true, fileSize: sizeInBytes };
};

/**
 * Compress and resize image
 * @param imageUri - URI of the image to compress
 * @param options - Compression options
 * @returns Promise<CompressionResult> - Compression result
 */
export const compressImage = async (
  imageUri: string,
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  const {
    quality = IMAGE_COMPRESSION_CONFIG.COMPRESSION_QUALITY,
    maxWidth = IMAGE_COMPRESSION_CONFIG.MAX_DIMENSIONS.width,
    maxHeight = IMAGE_COMPRESSION_CONFIG.MAX_DIMENSIONS.height,
    format = ImageManipulator.SaveFormat.JPEG,
    returnBase64 = false,
  } = options;

  try {
    // Get original file size
    const originalInfo = await FileSystem.getInfoAsync(imageUri, {
      size: true,
    });
    const originalSize =
      "size" in originalInfo && originalInfo.size ? originalInfo.size : 0;

    // Compress and resize image
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      {
        compress: quality,
        format,
        base64: false,
      }
    );

    // Get compressed file size
    const compressedInfo = await FileSystem.getInfoAsync(manipResult.uri, {
      size: true,
    });
    const compressedSize =
      "size" in compressedInfo && compressedInfo.size ? compressedInfo.size : 0;

    let base64: string | undefined;
    if (returnBase64) {
      const formatStr =
        format === ImageManipulator.SaveFormat.JPEG
          ? "jpeg"
          : format === ImageManipulator.SaveFormat.PNG
          ? "png"
          : "webp";
      base64 = await imageToBase64(manipResult.uri, formatStr);
    }

    return {
      success: true,
      compressedUri: manipResult.uri,
      base64,
      originalSize,
      compressedSize,
    };
  } catch (error) {
    console.error("Image compression error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to compress image",
    };
  }
};

/**
 * Compress image with automatic retry using lower quality if needed
 * @param imageUri - URI of the image to compress
 * @param targetSize - Target size in bytes (default: Firestore limit)
 * @param options - Compression options
 * @returns Promise<CompressionResult> - Compression result
 */
export const compressImageToSize = async (
  imageUri: string,
  targetSize: number = IMAGE_COMPRESSION_CONFIG.FIRESTORE_LIMIT,
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  const qualities = [0.8, 0.6, 0.4, 0.2]; // Quality levels to try

  for (const quality of qualities) {
    const result = await compressImage(imageUri, {
      ...options,
      quality,
      returnBase64: true,
    });

    if (!result.success) {
      return result;
    }

    if (result.base64) {
      const base64Size = getBase64Size(result.base64);
      if (base64Size <= targetSize) {
        return {
          ...result,
          compressedSize: base64Size,
        };
      }
    }
  }

  return {
    success: false,
    error: `Unable to compress image to target size of ${Math.round(
      targetSize / 1024
    )}KB`,
  };
};

/**
 * Clean up temporary compressed image file
 * @param compressedUri - URI of the compressed image to delete
 */
export const cleanupCompressedImage = async (
  compressedUri: string
): Promise<void> => {
  try {
    await FileSystem.deleteAsync(compressedUri, { idempotent: true });
  } catch (error) {
    console.warn("Failed to cleanup compressed image:", error);
  }
};
