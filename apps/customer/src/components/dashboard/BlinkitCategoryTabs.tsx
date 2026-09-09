import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Sparkles, Headphones, Heart, Pill, Shirt, Home, Wine } from 'lucide-react-native';
import { Colors, Shadows } from '../../theme';
import { triggerHaptic } from '../../utils/haptics';

export interface CategoryTabItem {
  id: string;
  name: string;
  icon: string;
  isNew?: boolean;
}

const DEFAULT_TABS: CategoryTabItem[] = [
  { id: 'all', name: 'All', icon: 'bottles' },
  { id: 'festival', name: 'Ganeshotsav', icon: 'festival', isNew: true },
  { id: 'electronics', name: 'Electronics', icon: 'headphones' },
  { id: 'beauty', name: 'Beauty', icon: 'beauty' },
  { id: 'pharmacy', name: 'Pharmacy', icon: 'pharmacy' },
  { id: 'fashion', name: 'Fashion', icon: 'fashion' },
  { id: 'home', name: 'Home', icon: 'home' },
];

interface BlinkitCategoryTabsProps {
  selectedTabId?: string;
  onSelectTab: (tabId: string) => void;
  tabs?: CategoryTabItem[];
}

export const BlinkitCategoryTabs: React.FC<BlinkitCategoryTabsProps> = ({
  selectedTabId = 'all',
  onSelectTab,
  tabs = DEFAULT_TABS,
}) => {
  const renderTabIcon = (tab: CategoryTabItem, isSelected: boolean) => {
    const iconColor = isSelected ? '#0F172A' : '#475569';
    switch (tab.icon) {
      case 'bottles':
        return <Wine size={20} color={iconColor} />;
      case 'festival':
        return <Sparkles size={20} color={iconColor} />;
      case 'headphones':
        return <Headphones size={20} color={iconColor} />;
      case 'beauty':
        return <Heart size={20} color={iconColor} />;
      case 'pharmacy':
        return <Pill size={20} color={iconColor} />;
      case 'fashion':
        return <Shirt size={20} color={iconColor} />;
      case 'home':
        return <Home size={20} color={iconColor} />;
      default:
        return <Wine size={20} color={iconColor} />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {tabs.map((tab) => {
          const isSelected = selectedTabId === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.75}
              onPress={() => {
                triggerHaptic('selection');
                onSelectTab(tab.id);
              }}
              style={styles.tabItem}
            >
              <View style={styles.iconWrapper}>
                {renderTabIcon(tab, isSelected)}
                {tab.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>
                {tab.name}
              </Text>

              {/* Active Indicator Underline */}
              {isSelected ? (
                <View style={styles.activeIndicator} />
              ) : (
                <View style={styles.indicatorPlaceholder} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginTop: 4,
  },
  scrollList: {
    paddingHorizontal: 12,
    gap: 16,
  },
  tabItem: {
    alignItems: 'center',
    paddingTop: 8,
    minWidth: 54,
  },
  iconWrapper: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -16,
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
    marginBottom: 6,
  },
  tabLabelSelected: {
    color: '#0F172A',
    fontWeight: '800',
  },
  activeIndicator: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  indicatorPlaceholder: {
    width: '100%',
    height: 2.5,
    backgroundColor: 'transparent',
  },
});
