import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, FolderOpen, X } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

export interface SelectedFilePayload {
  uri: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string, filePayload?: SelectedFilePayload) => void;
  title?: string;
  allowsEditing?: boolean;
  aspect?: [number, number];
  showDocumentOption?: boolean;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  title = 'Select Source',
  allowsEditing = false,
  aspect = [1, 1],
  showDocumentOption = false,
}) => {
  // Web-compatible native HTML file input trigger
  const triggerWebFileInput = (acceptType: string, captureMode?: 'user' | 'environment') => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = acceptType;
      if (captureMode) {
        input.capture = captureMode;
      }
      input.onchange = (event: any) => {
        const file = event.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const dataUrl = e.target?.result as string;
            if (dataUrl) {
              onImageSelected(dataUrl, {
                uri: dataUrl,
                name: file.name,
                size: file.size,
                mimeType: file.type,
              });
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      onClose();
      return true;
    }
    return false;
  };

  const handleLaunchCamera = async () => {
    // Web environment
    if (Platform.OS === 'web') {
      triggerWebFileInput('image/*', 'environment');
      return;
    }

    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in settings to capture photo.'
        );
        return;
      }

      onClose();
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: allowsEditing,
        aspect: aspect,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onImageSelected(asset.uri, {
          uri: asset.uri,
          name: asset.fileName || `camera_${Date.now()}.jpg`,
          size: asset.fileSize,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (err: any) {
      console.warn('Camera launch error:', err);
    }
  };

  const handleLaunchGallery = async () => {
    // Web environment
    if (Platform.OS === 'web') {
      triggerWebFileInput('image/*');
      return;
    }

    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Photo Library Permission Required',
          'Please enable photo library access in settings to select photo.'
        );
        return;
      }

      onClose();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: allowsEditing,
        aspect: aspect,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onImageSelected(asset.uri, {
          uri: asset.uri,
          name: asset.fileName || `gallery_${Date.now()}.jpg`,
          size: asset.fileSize,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (err: any) {
      console.warn('Gallery launch error:', err);
    }
  };

  const handleLaunchDocumentPicker = async () => {
    // Web environment
    if (Platform.OS === 'web') {
      triggerWebFileInput('application/pdf,image/*,.pdf,.jpg,.jpeg,.png');
      return;
    }

    try {
      // Dynamic import to avoid crashes if expo-document-picker is not installed
      const DocumentPicker = await import('expo-document-picker').catch(() => null);
      if (DocumentPicker && DocumentPicker.getDocumentAsync) {
        onClose();
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'image/*'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          onImageSelected(asset.uri, {
            uri: asset.uri,
            name: asset.name,
            size: asset.size,
            mimeType: asset.mimeType || 'application/pdf',
          });
        }
      } else {
        // Fallback to gallery picker for documents on native
        handleLaunchGallery();
      }
    } catch (err: any) {
      console.warn('Document picker error, falling back to gallery:', err);
      handleLaunchGallery();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Drag Handle Bar */}
              <View style={styles.handleBar} />

              {/* Sheet Header */}
              <View style={styles.headerRow}>
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Picker Options List */}
              <View style={styles.optionsList}>
                {/* Option 1: Take Photo (Always Available) */}
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={handleLaunchCamera}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Take Photo"
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
                    <Camera size={22} color="#FF6600" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Take Photo</Text>
                    <Text style={styles.optionSubtitle}>Use camera to capture clean photo</Text>
                  </View>
                </TouchableOpacity>

                {/* Option 2: Choose from Gallery (Always Available) */}
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={handleLaunchGallery}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Choose from Gallery"
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <ImageIcon size={22} color="#10B981" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Choose from Gallery</Text>
                    <Text style={styles.optionSubtitle}>Select image from device gallery</Text>
                  </View>
                </TouchableOpacity>

                {/* Option 3: Browse Files (PDF / Documents) - ONLY when showDocumentOption is true */}
                {showDocumentOption && (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={handleLaunchDocumentPicker}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Browse Files (PDF / Documents)"
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#F5F3FF' }]}>
                      <FolderOpen size={22} color="#8B5CF6" />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Browse Files (PDF / Documents)</Text>
                      <Text style={styles.optionSubtitle}>Select PDF or document file from device</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              {/* Cancel Action Button */}
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  title: {
    ...Typography.titleMedium,
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.bodyLarge,
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
  optionSubtitle: {
    ...Typography.bodySmall,
    color: '#64748B',
    marginTop: 2,
    fontSize: 12,
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelText: {
    ...Typography.bodyMedium,
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default ImagePickerModal;
