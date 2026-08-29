import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, BorderRadius } from '../theme';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  badgeColor?: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: any) => void;
  scrollable?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  scrollable = false,
}) => {
  const content = tabs.map((tab) => {
    const isActive = activeTab === tab.key;
    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => onTabChange(tab.key)}
        activeOpacity={0.7}
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
      >
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {tab.label}
        </Text>
        {tab.count !== undefined && tab.count > 0 ? (
          <View
            style={[
              styles.countBadge,
              isActive ? styles.countBadgeActive : null,
              tab.badgeColor ? { backgroundColor: tab.badgeColor } : null,
            ]}
          >
            <Text
              style={[
                styles.countText,
                isActive ? styles.countTextActive : null,
              ]}
            >
              {tab.count}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.container}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={[styles.container, styles.flexContainer]}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.borderLight,
    padding: 4,
    borderRadius: BorderRadius.lg,
    marginVertical: 10,
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flexContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: 6,
  },
  countBadgeActive: {
    backgroundColor: Colors.primary,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  countTextActive: {
    color: '#FFFFFF',
  },
});
