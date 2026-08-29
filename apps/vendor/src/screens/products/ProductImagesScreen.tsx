import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Plus, Trash2, Star, Image as ImageIcon } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ProductImage } from '../../types';
import { VendorApi } from '../../services/vendorApi';

export const ProductImagesScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { productId } = route.params;
  const [images, setImages] = useState<ProductImage[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUrl, setNewUrl] = useState(
    'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=500&q=80'
  );

  useEffect(() => {
    const load = async () => {
      try {
        const prod = await VendorApi.getProduct(productId);
        setImages(prod.images || []);
      } catch {
        // handle
      }
    };
    load();
  }, [productId]);

  const handleAddImage = () => {
    if (!newUrl) return;
    const newImg: ProductImage = {
      id: `img-${Date.now()}`,
      productId,
      url: newUrl,
      isPrimary: images.length === 0,
      sortOrder: images.length,
    };
    setImages([...images, newImg]);
    setModalVisible(false);
  };

  const handleSetPrimary = (id: string) => {
    setImages(images.map((img) => ({ ...img, isPrimary: img.id === id })));
  };

  const handleDelete = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  return (
    <View style={styles.container}>
      <Header
        title="Product Images"
        subtitle="Manage primary & gallery product pictures"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.addBtn}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grid}>
          {images.map((img) => (
            <View key={img.id} style={styles.imageCard}>
              <Image source={{ uri: img.url }} style={styles.image} />
              <View style={styles.imageOverlay}>
                {img.isPrimary ? (
                  <View style={styles.primaryBadge}>
                    <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.primaryText}>Cover</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleSetPrimary(img.id)}
                    style={styles.setPrimaryBtn}
                  >
                    <Text style={styles.setPrimaryText}>Set Cover</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleDelete(img.id)}
                  style={styles.deleteIcon}
                >
                  <Trash2 size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Add Product Image URL"
      >
        <Input
          label="Direct Image URL"
          placeholder="https://..."
          value={newUrl}
          onChangeText={setNewUrl}
          leftIcon={<ImageIcon size={18} color={Colors.textSecondary} />}
        />
        <Button title="Add Image" onPress={handleAddImage} style={{ marginTop: 10 }} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageCard: {
    width: '48%',
    height: 160,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: Colors.surface,
    ...Shadows.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  setPrimaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  setPrimaryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  deleteIcon: {
    padding: 4,
  },
});
