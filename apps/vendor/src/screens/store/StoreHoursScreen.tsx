import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Clock, Check, Calendar } from 'lucide-react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../stores/authStore';
import { VendorApi } from '../../services/vendorApi';

export const StoreHoursScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { vendor, updateVendor } = useAuthStore();

  const [openingTime, setOpeningTime] = useState(vendor?.openingTime || '08:00');
  const [closingTime, setClosingTime] = useState(vendor?.closingTime || '23:00');
  const [holidayMode, setHolidayMode] = useState(false);
  const [schedule, setSchedule] = useState<any>(
    vendor?.storeHours || {
      Monday: { open: '08:00', close: '23:00', closed: false },
      Tuesday: { open: '08:00', close: '23:00', closed: false },
      Wednesday: { open: '08:00', close: '23:00', closed: false },
      Thursday: { open: '08:00', close: '23:00', closed: false },
      Friday: { open: '08:00', close: '23:00', closed: false },
      Saturday: { open: '08:00', close: '23:30', closed: false },
      Sunday: { open: '08:00', close: '23:30', closed: false },
    }
  );
  const [loading, setLoading] = useState(false);

  const toggleDayClosed = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        closed: !schedule[day]?.closed,
      },
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await VendorApi.updateStoreHours({
        openingTime,
        closingTime,
        storeHours: schedule,
      });
      updateVendor({ openingTime, closingTime, storeHours: schedule });
      Alert.alert('Store Hours Saved', 'Weekly schedule has been published.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Store Operating Hours"
        subtitle="7-day schedule & order window"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Holiday Mode Toggle */}
        <View style={styles.holidayCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.holidayTitle}>🌴 Holiday / Vacation Mode</Text>
            <Text style={styles.holidaySub}>
              Temporarily close store for festival or holidays without altering weekly timings.
            </Text>
          </View>
          <Switch
            value={holidayMode}
            onValueChange={setHolidayMode}
            trackColor={{ false: '#CBD5E1', true: '#FECDD3' }}
            thumbColor={holidayMode ? Colors.danger : '#94A3B8'}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏰ Standard Daily Hours</Text>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Opening Time"
                value={openingTime}
                onChangeText={setOpeningTime}
                placeholder="08:00"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Closing Time"
                value={closingTime}
                onChangeText={setClosingTime}
                placeholder="23:00"
              />
            </View>
          </View>
        </View>

        {/* 7-Day Day-by-Day Table */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Weekly Operating Days</Text>
          {Object.keys(schedule).map((day) => {
            const item = schedule[day] || { open: '08:00', close: '23:00', closed: false };
            return (
              <View key={day} style={styles.dayRow}>
                <View style={styles.dayCol}>
                  <Text style={styles.dayName}>{day}</Text>
                  <Text style={styles.dayHours}>
                    {item.closed ? 'Closed all day' : `${item.open} - ${item.close}`}
                  </Text>
                </View>

                <View style={styles.dayActionCol}>
                  <Text style={[styles.closedText, !item.closed && { color: Colors.primary }]}>
                    {item.closed ? 'Closed' : 'Open'}
                  </Text>
                  <Switch
                    value={!item.closed}
                    onValueChange={() => toggleDayClosed(day)}
                    trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
                    thumbColor={!item.closed ? Colors.primary : '#94A3B8'}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <Button
          title="Update Schedule"
          onPress={handleSave}
          loading={loading}
          leftIcon={<Check size={18} color="#FFFFFF" />}
          style={{ marginBottom: 40 }}
        />
      </ScrollView>
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
  holidayCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  holidayTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9F1239',
  },
  holidaySub: {
    fontSize: 12,
    color: '#881337',
    marginTop: 2,
    marginRight: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dayCol: {},
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dayHours: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dayActionCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginRight: 8,
  },
});
