import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { ArrowUp } from 'lucide-react-native';
import {
  BLINKIT_GROUPED_CATEGORIES,
  GroupedCategorySection,
  SubCategoryItem,
} from '../../services/categoryCatalogData';
import { CATEGORY_WEBP_ASSETS } from '../../services/categoryWebpAssets';
import { triggerHaptic } from '../../utils/haptics';

interface BlinkitGroupedCategoryGridProps {
  sections?: GroupedCategorySection[];
  onPressSubcategory: (sub: SubCategoryItem, section: GroupedCategorySection) => void;
  onPressBackToTop?: () => void;
}

// Chunk items strictly into 4 columns per row
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export const BlinkitGroupedCategoryGrid: React.FC<BlinkitGroupedCategoryGridProps> = ({
  sections = BLINKIT_GROUPED_CATEGORIES,
  onPressSubcategory,
  onPressBackToTop,
}) => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.responsiveInnerContainer}>
        {sections.map((section, sectionIndex) => {
          const rows = chunkArray(section.subcategories, 4);

          return (
            <View key={section.id} style={styles.sectionBlock}>
              {/* Compact Section Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>

                {/* "↑ Back to top" on the first category */}
                {sectionIndex === 0 && onPressBackToTop ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.backToTopButton}
                    onPress={() => {
                      triggerHaptic('light');
                      onPressBackToTop();
                    }}
                  >
                    <View style={styles.arrowCircle}>
                      <ArrowUp size={10} color="#0F172A" strokeWidth={2.6} />
                    </View>
                    <Text style={styles.backToTopText}>Back to top</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* All 4 Columns strictly fitted in 1 row with minimum gap */}
              <View style={styles.gridTable}>
                {rows.map((rowItems, rowIndex) => (
                  <View
                    key={`row-${section.id}-${rowIndex}`}
                    style={styles.gridRow}
                  >
                    {rowItems.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.75}
                        style={styles.colWrapper}
                        onPress={() => {
                          triggerHaptic('selection');
                          onPressSubcategory(item, section);
                        }}
                      >
                        {/* Compact rounded card container */}
                        <View style={styles.imageCard}>
                          <Image
                            source={CATEGORY_WEBP_ASSETS[item.id] || { uri: item.imageUrl }}
                            style={styles.productImage}
                            resizeMode="contain"
                          />
                          {item.badge ? (
                            <View style={styles.badgeChip}>
                              <Text style={styles.badgeText}>{item.badge}</Text>
                            </View>
                          ) : null}
                        </View>

                        {/* Compact 2-line label */}
                        <View style={styles.labelContainer}>
                          <Text
                            numberOfLines={2}
                            ellipsizeMode="tail"
                            allowFontScaling={false}
                            style={styles.itemLabel}
                          >
                            {item.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}

                    {/* Pad incomplete row with invisible spacers to maintain 4-column alignment */}
                    {Array.from({
                      length: Math.max(0, 4 - rowItems.length),
                    }).map((_, spacerIndex) => (
                      <View
                        key={`spacer-${spacerIndex}`}
                        style={[styles.colWrapper, { opacity: 0 }]}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: 'center',
  },
  responsiveInnerContainer: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  sectionBlock: {
    marginBottom: 16,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  backToTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  arrowCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  backToTopText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  gridTable: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  colWrapper: {
    width: '23.5%',
    maxWidth: '24%',
    alignItems: 'center',
  },
  imageCard: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#EDF4F7',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '84%',
    height: '84%',
  },
  badgeChip: {
    position: 'absolute',
    top: 3,
    left: 3,
    backgroundColor: '#059669',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  labelContainer: {
    marginTop: 3,
    minHeight: 25,
    maxHeight: 27,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  itemLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 12,
    ...Platform.select({
      web: {
        wordBreak: 'break-word',
      },
      default: {},
    }),
  },
});
