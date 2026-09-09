import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MainTabParamList } from '../types';
import { Colors, Shadows } from '../theme';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CategoriesScreen } from '../screens/catalog/CategoriesScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { CouponScreen } from '../screens/checkout/CouponScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '../utils/haptics';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_CONFIG: Record<string, { label: string; icon: any }> = {
  HomeTab: {
    label: 'Home',
    icon: require('../../assets/images/tabs/tab_home_3d.jpg'),
  },
  OrdersTab: {
    label: 'Order Again',
    icon: require('../../assets/images/tabs/tab_orders_3d.jpg'),
  },
  CategoriesTab: {
    label: 'Category',
    icon: require('../../assets/images/tabs/tab_categories_3d.jpg'),
  },
  OffersTab: {
    label: 'Offers',
    icon: require('../../assets/images/tabs/tab_offers_3d.jpg'),
  },
  ProfileTab: {
    label: 'SevaZo',
    icon: require('../../assets/images/tabs/tab_sevazo_3d.jpg'),
  },
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  // Ensure generous bottom padding on both Safari/web (insets=0) and iPhone native (insets=34)
  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: bottomPadding }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name] || {
          label: route.name,
          icon: TAB_CONFIG.HomeTab.icon,
        };

        const onPress = () => {
          triggerHaptic('selection');
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={config.label}
            activeOpacity={0.75}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <View
              style={[
                styles.iconBox,
                isFocused && styles.iconBoxFocused,
              ]}
            >
              <Image
                source={config.icon}
                style={[
                  styles.tabIconImg,
                  isFocused
                    ? styles.tabIconImgFocused
                    : styles.tabIconImgInactive,
                ]}
                resizeMode="cover"
              />
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelFocused : styles.tabLabelInactive,
              ]}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} />
      <Tab.Screen name="CategoriesTab" component={CategoriesScreen} />
      <Tab.Screen name="OffersTab" component={CouponScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.2,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    ...Shadows.card,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxFocused: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.2,
    borderColor: '#F59E0B',
  },
  tabIconImg: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  tabIconImgFocused: {
    transform: [{ scale: 1.06 }],
  },
  tabIconImgInactive: {
    opacity: 0.68,
  },
  tabLabel: {
    fontSize: 9.5,
    marginTop: 3,
    textAlign: 'center',
    letterSpacing: 0,
  },
  tabLabelFocused: {
    color: '#0F172A',
    fontWeight: '800',
  },
  tabLabelInactive: {
    color: '#64748B',
    fontWeight: '600',
  },
});
