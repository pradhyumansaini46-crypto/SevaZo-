import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Mic, ArrowLeft } from 'lucide-react-native';
import { BlinkitGroupedCategoryGrid } from '../../components/dashboard/BlinkitGroupedCategoryGrid';
import {
  BLINKIT_GROUPED_CATEGORIES,
  GroupedCategorySection,
  SubCategoryItem,
} from '../../services/categoryCatalogData';
import { customerApi } from '../../services/customerApi';
import { triggerHaptic } from '../../utils/haptics';

export const CategoriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);
  const [selectedPill, setSelectedPill] = useState<string>('all');
  const [sections, setSections] = useState<GroupedCategorySection[]>(BLINKIT_GROUPED_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    customerApi.getGroupedCategories().then((res) => {
      if (isMounted && res && res.length > 0) {
        setSections(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSections =
    selectedPill === 'all'
      ? sections
      : sections.filter((sec) => sec.id === selectedPill);

  const handleSelectSubcategory = (
    sub: SubCategoryItem,
    section: GroupedCategorySection
  ) => {
    navigation.navigate('SearchResults', {
      query: sub.query || sub.name,
      categoryName: sub.name,
      categoryId: sub.id,
      sectionTitle: section.title,
    });
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Search Bar Header (Blinkit Style) */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              triggerHaptic('light');
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('HomeTab');
              }
            }}
          >
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.titleTextWrap}>
            <Text style={styles.screenTitle}>All Categories</Text>
            <Text style={styles.screenSubtitle}>Explore 60+ departments & essentials</Text>
          </View>
        </View>

        {/* Search Bar Input Pill */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.searchBar}
          onPress={() => {
            triggerHaptic('light');
            navigation.navigate('Search');
          }}
        >
          <Search size={18} color="#64748B" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>
            Search for atta, dal, coke and more
          </Text>
          <TouchableOpacity
            style={styles.micButton}
            onPress={() => {
              triggerHaptic('light');
              navigation.navigate('Search');
            }}
          >
            <Mic size={18} color="#059669" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Category Horizontal Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScrollContent}
        >
          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              styles.pillButton,
              selectedPill === 'all' && styles.pillButtonActive,
            ]}
            onPress={() => {
              triggerHaptic('selection');
              setSelectedPill('all');
            }}
          >
            <Text
              style={[
                styles.pillText,
                selectedPill === 'all' && styles.pillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {BLINKIT_GROUPED_CATEGORIES.map((cat) => {
            const isSelected = selectedPill === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.75}
                style={[styles.pillButton, isSelected && styles.pillButtonActive]}
                onPress={() => {
                  triggerHaptic('selection');
                  setSelectedPill(cat.id);
                }}
              >
                <Text
                  style={[styles.pillText, isSelected && styles.pillTextActive]}
                >
                  {cat.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Grouped Category 4-Column Grid View */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        <BlinkitGroupedCategoryGrid
          sections={filteredSections}
          onPressSubcategory={handleSelectSubcategory}
          onPressBackToTop={scrollToTop}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleTextWrap: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13.5,
    color: '#94A3B8',
    fontWeight: '400',
  },
  micButton: {
    padding: 4,
  },
  pillsScrollContent: {
    paddingVertical: 4,
    gap: 8,
  },
  pillButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillButtonActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollBody: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});
