import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { RatingStars } from '../../components/RatingStars';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Star, ThumbsUp, CheckCircle, Plus } from 'lucide-react-native';
import { customerApi } from '../../services/customerApi';
import { Review } from '../../types';

export const ReviewsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const productId = route.params?.productId || 'prod-1';
  const productName = route.params?.productName || 'Product Reviews';

  const [reviews, setReviews] = useState<Review[]>([]);
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    const data = await customerApi.getReviews(productId);
    setReviews(data);
  };

  const handlePostReview = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const created = await customerApi.addReview({
      productId,
      rating: newRating,
      comment: newComment.trim(),
    });
    setReviews([created, ...reviews]);
    setSubmitting(false);
    setWriteModalVisible(false);
    setNewComment('');
  };

  return (
    <View style={styles.container}>
      <Header
        showBack
        onPressBack={() => navigation.goBack()}
        title="Ratings & Reviews"
        subtitle={productName}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Rating Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.scoreCol}>
            <Text style={styles.bigScore}>4.8</Text>
            <RatingStars rating={4.8} size={16} />
            <Text style={styles.totalReviewsCount}>
              {reviews.length + 150} verified ratings
            </Text>
          </View>

          {/* Breakdown bars */}
          <View style={styles.breakdownCol}>
            {[
              { star: 5, pct: '85%' },
              { star: 4, pct: '10%' },
              { star: 3, pct: '3%' },
              { star: 2, pct: '1%' },
              { star: 1, pct: '1%' },
            ].map((row) => (
              <View key={row.star} style={styles.barRow}>
                <Text style={styles.barLabel}>{row.star}★</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: row.pct as any }]} />
                </View>
                <Text style={styles.barPct}>{row.pct}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Write Review Trigger */}
        <View style={styles.writeRow}>
          <Text style={styles.reviewsListHeading}>Customer Feedback</Text>
          <Button
            title="Write a Review"
            onPress={() => setWriteModalVisible(true)}
            variant="outline"
            size="sm"
            icon={<Plus size={14} color={Colors.primary} />}
          />
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.reviewTopRow}>
                <View style={styles.userWrap}>
                  <Image
                    source={{ uri: rev.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
                    style={styles.avatar}
                  />
                  <View style={{ marginLeft: Spacing.sm }}>
                    <Text style={styles.userName}>{rev.customerName}</Text>
                    {rev.verifiedPurchase ? (
                      <View style={styles.verifiedRow}>
                        <CheckCircle size={11} color={Colors.success} />
                        <Text style={styles.verifiedText}>Verified Buyer</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <Text style={styles.reviewDate}>{rev.createdAt}</Text>
              </View>

              <RatingStars rating={rev.rating} size={14} style={{ marginVertical: Spacing.xs }} />

              <Text style={styles.commentText}>{rev.comment}</Text>

              <View style={styles.reviewFooter}>
                <TouchableOpacity style={styles.helpfulBtn}>
                  <ThumbsUp size={13} color={Colors.textMuted} />
                  <Text style={styles.helpfulText}>
                    Helpful ({rev.likesCount || 0})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Write Review Modal */}
      <Modal
        visible={writeModalVisible}
        onClose={() => setWriteModalVisible(false)}
        title="Rate & Review Product"
        footer={
          <Button
            title="Submit Review"
            onPress={handlePostReview}
            loading={submitting}
            disabled={!newComment.trim()}
            size="md"
          />
        }
      >
        <View style={styles.modalBody}>
          <Text style={styles.rateTitle}>Select your rating</Text>
          <View style={styles.starsSelector}>
            <RatingStars
              rating={newRating}
              size={32}
              interactive
              onRate={(r) => setNewRating(r)}
            />
          </View>

          <Text style={styles.commentLabel}>Write your experience</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us what you liked about this item, the packaging, or delivery speed..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
            value={newComment}
            onChangeText={setNewComment}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  overviewCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  scoreCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: Spacing.lg,
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
    width: '40%',
  },
  bigScore: {
    ...Typography.hero,
    fontSize: 38,
    color: Colors.textPrimary,
    fontWeight: '900',
  },
  totalReviewsCount: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  breakdownCol: {
    flex: 1,
    paddingLeft: Spacing.md,
    justifyContent: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  barLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    width: 20,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.starGold,
    borderRadius: BorderRadius.full,
  },
  barPct: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.textMuted,
    width: 26,
    textAlign: 'right',
  },
  writeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  reviewsListHeading: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
  },
  reviewsList: {},
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
  },
  userName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.success,
    marginLeft: 3,
  },
  reviewDate: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textMuted,
  },
  commentText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginVertical: 4,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulText: {
    ...Typography.bodySmall,
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  modalBody: {
    paddingVertical: Spacing.sm,
  },
  rateTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  starsSelector: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  commentLabel: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  textArea: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    height: 100,
    textAlignVertical: 'top',
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
  },
});
