import { PermissionsAndroid, Platform } from 'react-native';

export type PermissionResult = {
  granted: boolean;
  reason?: string;
};

export const requestCameraPermission = async (): Promise<PermissionResult> => {
  if (Platform.OS !== 'android') {
    return { granted: true };
  }

  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );

    return {
      granted: result === PermissionsAndroid.RESULTS.GRANTED,
      reason:
        result === PermissionsAndroid.RESULTS.GRANTED
          ? undefined
          : 'Camera permission is required to take a photo.',
    };
  } catch {
    return { granted: false, reason: 'Failed to request camera permission.' };
  }
};

export const requestPhotoLibraryPermission =
  async (): Promise<PermissionResult> => {
    if (Platform.OS !== 'android') {
      return { granted: true };
    }

    try {
      const permission =
        typeof Platform.Version === 'number' && Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      const result = await PermissionsAndroid.request(permission);

      return {
        granted: result === PermissionsAndroid.RESULTS.GRANTED,
        reason:
          result === PermissionsAndroid.RESULTS.GRANTED
            ? undefined
            : 'Photo permission is required to choose an image from gallery.',
      };
    } catch {
      return { granted: false, reason: 'Failed to request photo permission.' };
    }
  };
