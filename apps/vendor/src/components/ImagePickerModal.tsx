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
import * as DocumentPicker from 'expo-document-picker';
import { Camera, Image as ImageIcon, FolderOpen, X } from 'lucide-react-native';
import { getThemeColors, BorderRadius } from '../theme';
import { useThemeStore } from '../stores/themeStore';

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
  title = 'Select Image Source',
  allowsEditing = true,
  aspect = [1, 1],
  showDocumentOption = true,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const isDark = themeMode === 'DARK';

  const ensureCameraPermission = async (): Promise<boolean> => {
    try {
      const current = await ImagePicker.getCameraPermissionsAsync();
      if (current.status === 'granted') return true;
      const req = await ImagePicker.requestCameraPermissionsAsync();
      return req.status === 'granted';
    } catch {
      return true;
    }
  };

  const ensureMediaPermission = async (): Promise<boolean> => {
    try {
      const current = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (current.status === 'granted') return true;
      const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return req.status === 'granted';
    } catch {
      return true;
    }
  };

  const doLaunchCamera = async () => {
    try {
      const hasPermission = await ensureCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable Camera permissions in your phone settings.'
        );
        onClose();
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: allowsEditing,
        aspect: aspect,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onImageSelected(asset.uri, {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now().toString().slice(-4)}.jpg`,
          size: asset.fileSize,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (err: any) {
      console.warn('Camera launch error:', err);
    } finally {
      onClose();
    }
  };

  const doLaunchGallery = async () => {
    try {
      const hasPermission = await ensureMediaPermission();
      if (!hasPermission) {
        Alert.alert(
          'Photo Library Permission Required',
          'Please enable Photo Library permissions in your phone settings.'
        );
        onClose();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: allowsEditing,
        aspect: aspect,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onImageSelected(asset.uri, {
          uri: asset.uri,
          name: asset.fileName || `gallery_image_${Date.now().toString().slice(-4)}.jpg`,
          size: asset.fileSize,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (err: any) {
      console.warn('Gallery launch error:', err);
    } finally {
      onClose();
    }
  };

  const doLaunchDocumentPicker = async () => {
    try {
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
    } catch (err: any) {
      console.warn('Document picker error:', err);
      Alert.alert('Document Error', err?.message || 'Could not open document picker.');
    } finally {
      onClose();
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
            <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Top drag handle indicator */}
              <View style={[styles.handleBar, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }]} />

              <View style={styles.headerRow}>
                <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
                  activeOpacity={0.7}
                >
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsList}>
                {/* Option 1: Take Photo */}
                <TouchableOpacity
                  style={[styles.optionItem, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                  onPress={doLaunchCamera}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Take Photo"
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
                    <Camera size={24} color="#FF6600" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Take Photo</Text>
                    <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>Use phone camera to capture photo</Text>
                  </View>
                </TouchableOpacity>

                {/* Option 2: Choose from Gallery */}
                <TouchableOpacity
                  style={[styles.optionItem, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                  onPress={doLaunchGallery}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Choose from Gallery"
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <ImageIcon size={24} color="#10B981" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Choose from Gallery</Text>
                    <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>Select photo from library album</Text>
                  </View>
                </TouchableOpacity>

                {/* Option 3: Browse Files (PDF) */}
                {showDocumentOption && (
                  <TouchableOpacity
                    style={[styles.optionItem, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                    onPress={doLaunchDocumentPicker}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Browse Files (PDF)"
                  >
                    <View style={[styles.iconCircle, { backgroundColor: '#F5F3FF' }]}>
                      <FolderOpen size={24} color="#8B5CF6" />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Browse Files (PDF)</Text>
                      <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>Select PDF or document from device files</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelText, { color: colors.textPrimary }]}>Cancel</Text>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
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
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
  },
  optionsList: {
    gap: 12,
    marginBottom: 18,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  optionSubtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelText: {
    fontWeight: '700',
    fontSize: 15,
  },
});

export default ImagePickerModal;
