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
import { Colors, Typography, Spacing } from '../theme';

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
  title = 'Select Document Source',
  allowsEditing = false,
  aspect = [4, 3],
  showDocumentOption = false,
}) => {
  const handleLaunchCamera = async () => {
    onClose();
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission',
          'Please allow camera permission in settings to take photos of your documents.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onImageSelected(asset.uri, {
          uri: asset.uri,
          name: asset.fileName || `doc_cam_${Date.now().toString().slice(-4)}.jpg`,
          size: asset.fileSize,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (err: any) {
      console.warn('Camera picker error:', err);
    }
  };

  const handleLaunchGallery = async () => {
    onClose();
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission',
          'Please allow photo library permission in settings to upload documents.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        onImageSelected(asset.uri, {
          uri: asset.uri,
          name: asset.fileName || `doc_gallery_${Date.now().toString().slice(-4)}.jpg`,
          size: asset.fileSize,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (err: any) {
      console.warn('Gallery picker error:', err);
    }
  };

  const handleLaunchDocumentPicker = async () => {
    onClose();
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
              {/* Top handle bar */}
              <View style={styles.handleBar} />

              <View style={styles.headerRow}>
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <X size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsList}>
                {/* Option 1: Take Photo */}
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={handleLaunchCamera}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Take Photo"
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
                    <Camera size={24} color="#FF6600" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Take Photo</Text>
                    <Text style={styles.optionSubtitle}>Use phone camera to capture document</Text>
                  </View>
                </TouchableOpacity>

                {/* Option 2: Choose from Gallery */}
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={handleLaunchGallery}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Choose from Gallery"
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <ImageIcon size={24} color="#10B981" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Choose from Gallery</Text>
                    <Text style={styles.optionSubtitle}>Select document photo from gallery</Text>
                  </View>
                </TouchableOpacity>

                {/* Option 3: Browse Files (PDF / Documents) */}
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
                      <FolderOpen size={24} color="#8B5CF6" />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>Browse Files (PDF / Documents)</Text>
                      <Text style={styles.optionSubtitle}>Select PDF or document file from device</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              {/* Cancel Button */}
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
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  optionsList: {
    gap: 12,
    marginBottom: 18,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    ...Typography.bodyLarge,
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 16,
  },
  optionSubtitle: {
    ...Typography.bodySmall,
    color: '#64748B',
    marginTop: 2,
    fontSize: 12,
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelText: {
    ...Typography.bodyMedium,
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default ImagePickerModal;
