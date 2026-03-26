import ImageCropPicker from 'react-native-image-crop-picker';
import {
  launchCamera,
  launchImageLibrary,
  type CameraOptions,
  type ImageLibraryOptions,
  type Asset,
} from 'react-native-image-picker';
import { Platform } from 'react-native';
import { pick, types } from '@react-native-documents/picker';

import {
  requestCameraPermission,
  requestPhotoLibraryPermission,
} from './permissions';

export type PickedImage = {
  uri: string;
  fileName?: string;
  type?: string;
  width?: number;
  height?: number;
};

export type PickedVideo = {
  uri: string;
  fileName?: string;
  type?: string;
  size?: number;
};

export type PickedDocument = {
  uri: string;
  fileName?: string;
  type?: string;
  size?: number;
};

// Image compression quality (0.0 - 1.0)
// 0.9 = high quality with WebP compression
const IMAGE_QUALITY = 0.9;

// Maximum image dimensions (to reduce file size)
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;

const sanitizePickerUri = (uri: string) => {
  if (!uri) {
    return uri;
  }
  if (uri.includes('://')) {
    return uri;
  }
  return `file://${uri}`;
};

type CropPickerImage = {
  path: string;
  mime?: string;
  filename?: string;
  width?: number;
  height?: number;
  size?: number;
};

const mapCropPickerImage = (image?: CropPickerImage | null): PickedImage | null => {
  if (!image?.path) {
    return null;
  }

  const uri = sanitizePickerUri(image.path);
  const rawFileName =
    image.filename ||
    (image.path.includes('/') ? image.path.split('/').pop() : undefined);
  const normalizedFileName = rawFileName
    ? rawFileName.replace(/\.[^/.]+$/, '.webp')
    : `image-${Date.now()}.webp`;

  return {
    uri,
    fileName: normalizedFileName,
    type: 'image/webp',
    width: image.width,
    height: image.height,
  };
};

const mapPickerAssetToVideo = (asset?: Asset | null): PickedVideo | null => {
  if (!asset?.uri) {
    return null;
  }
  const uri = sanitizePickerUri(asset.uri);
  return {
    uri,
    fileName: asset.fileName || `video-${Date.now()}.mp4`,
    type: asset.type || 'video/mp4',
    size: asset.fileSize,
  };
};

const handlePickerError = (error: unknown) => {
  const pickerError = error as { code?: string; message?: string };
  if (
    pickerError?.code === 'E_PICKER_CANCELLED' ||
    pickerError?.message?.toLowerCase().includes('cancel')
  ) {
    return null;
  }
  throw new Error(pickerError?.message || 'Unable to select image.');
};

export const pickImageFromCamera = async (): Promise<PickedImage | null> => {
  const perm = await requestCameraPermission();
  if (!perm.granted) {
    throw new Error(perm.reason || 'Camera permission denied.');
  }

  try {
    const image = await ImageCropPicker.openCamera({
      mediaType: 'photo',
      compressImageFormat: 'webp',
      compressImageQuality: IMAGE_QUALITY,
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      cropping: false,
      includeExif: false,
      includeBase64: false,
    });
    return mapCropPickerImage(image);
  } catch (error) {
    return handlePickerError(error);
  }
};

export const pickVideoFromCamera = async (): Promise<PickedVideo | null> => {
  const perm = await requestCameraPermission();
  if (!perm.granted) {
    throw new Error(perm.reason || 'Camera permission denied.');
  }

  try {
    const options: CameraOptions = {
      mediaType: 'video',
      videoQuality: 'medium',
      durationLimit: 120,
    };
    const result = await launchCamera(options);
    if (result.didCancel) {
      return null;
    }
    if (result.errorCode) {
      throw new Error(result.errorMessage || 'Unable to record video.');
    }
    return mapPickerAssetToVideo(result.assets?.[0] || null);
  } catch (error) {
    const err = error as any;
    if (err?.code === 'E_PICKER_CANCELLED') {
      return null;
    }
    throw error;
  }
};

export const pickVideoFromGallery = async (): Promise<PickedVideo | null> => {
  const perm = await requestPhotoLibraryPermission();
  if (!perm.granted) {
    throw new Error(perm.reason || 'Photo permission denied.');
  }

  try {
    const options: ImageLibraryOptions = {
      mediaType: 'video',
      selectionLimit: 1,
    };
    const result = await launchImageLibrary(options);
    if (result.didCancel) {
      return null;
    }
    if (result.errorCode) {
      throw new Error(result.errorMessage || 'Unable to select video.');
    }
    return mapPickerAssetToVideo(result.assets?.[0] || null);
  } catch (error) {
    const err = error as any;
    if (err?.code === 'E_PICKER_CANCELLED') {
      return null;
    }
    throw error;
  }
};

export const pickImageFromGallery = async (
  enableCropping: boolean = false
): Promise<PickedImage | null> => {
  const perm = await requestPhotoLibraryPermission();
  if (!perm.granted) {
    throw new Error(perm.reason || 'Photo permission denied.');
  }

  try {
    const image = await ImageCropPicker.openPicker({
      mediaType: 'photo',
      multiple: false,
      compressImageFormat: 'webp',
      compressImageQuality: IMAGE_QUALITY,
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      cropping: enableCropping,
      includeExif: false,
      includeBase64: false,
    });
    return mapCropPickerImage(image);
  } catch (error) {
    return handlePickerError(error);
  }
};

export const pickDocument = async (): Promise<PickedDocument | null> => {
  try {
    console.log('[pickDocument] Starting document picker...');
    console.log('[pickDocument] Platform:', Platform.OS);
    console.log('[pickDocument] Available types:', Object.keys(types).slice(0, 10));
    
    const isSimulator = Platform.OS === 'ios' && __DEV__;
    if (isSimulator) {
      console.log('[pickDocument] ⚠️ Running on iOS Simulator - Document picker may not work properly');
    }
    
    const pickerConfig = Platform.OS === 'ios' 
      ? {
          type: [types.allFiles],
          allowMultiSelection: false,
          copyTo: 'cachesDirectory',
        }
      : {
          type: [
            types.pdf,
            types.doc,
            types.docx,
            types.zip,
          ],
          allowMultiSelection: false,
        };
    
    console.log('[pickDocument] Picker config:', pickerConfig);
    const results = await pick(pickerConfig);

    console.log('[pickDocument] Picker returned, results:', results);

    if (!results || results.length === 0) {
      console.log('[pickDocument] No results returned');
      return null;
    }

    const file = results[0];
    console.log('[pickDocument] File object:', file);
    
    const uri = file.uri || (file as any).fileCopyUri || (file as any).uri;
    console.log('[pickDocument] Extracted URI:', uri);

    if (!uri) {
      throw new Error('Unable to access the selected file.');
    }

    const result = {
      uri: sanitizePickerUri(uri),
      fileName: file.name || uri.split('/').pop() || `document-${Date.now()}`,
      type: file.type || undefined,
      size: file.size || undefined,
    };
    
    console.log('[pickDocument] Returning result:', result);
    return result;
  } catch (error: any) {
    console.log('[pickDocument] Error caught:', error);
    console.log('[pickDocument] Error message:', error?.message);
    console.log('[pickDocument] Error code:', error?.code);
    
    if (
      error?.message?.includes('cancel') ||
      error?.message?.includes('Cancel')
    ) {
      console.log('[pickDocument] User cancelled');
      return null;
    }
    
    if (Platform.OS === 'ios' && __DEV__) {
      const errorMsg = error?.message || '';
      if (
        errorMsg.includes('deallocated') ||
        errorMsg.includes('DocumentManager') ||
        errorMsg.includes('proxy')
      ) {
        console.log('[pickDocument] iOS Simulator Error - Document picker not supported');
        throw new Error(
          'Document picker is not supported in iOS Simulator.\n\nPlease test on a real iOS device to use document upload functionality.'
        );
      }
    }
    
    console.log('[pickDocument] Throwing error:', error?.message);
    throw new Error(error?.message || 'Unable to pick document.');
  }
};