import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  Clock,
  Navigation,
  CheckCircle2,
  Copy,
  Plus,
  Trash2,
  ShieldAlert,
  MapPin,
  Compass,
} from 'lucide-react-native';
import { getThemeColors, BorderRadius, Shadows } from '../../theme';
import { useThemeStore } from '../../stores/themeStore';
import { Button } from '../../components/Button';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { VendorApi } from '../../services/vendorApi';
import { useToast } from '../../hooks/useToast';
import { normalizeApiError } from '../../utils';

export interface DaySession {
  open: string;
  close: string;
}

export interface DaySchedule {
  day: string;
  isOpen: boolean;
  is24Hours: boolean;
  sessions: DaySession[];
}

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

interface HoursServiceAreaSectionProps {
  onSuccess?: () => void;
  onSaveDraft?: () => void;
}

export const HoursServiceAreaSection: React.FC<HoursServiceAreaSectionProps> = ({
  onSuccess,
  onSaveDraft,
}) => {
  const { themeMode } = useThemeStore();
  const colors = getThemeColors(themeMode);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState<number>(5);

  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS_OF_WEEK.map((day) => ({
      day,
      isOpen: day !== 'SUNDAY',
      is24Hours: false,
      sessions: [{ open: '09:00', close: '21:00' }],
    }))
  );

  useEffect(() => {
    let isMounted = true;
    const fetchHours = async () => {
      try {
        const state = await VendorApi.getOnboardingState();
        const store = state.data?.stores?.[0];
        if (isMounted) {
          if (store?.deliveryRadiusKm) {
            setDeliveryRadiusKm(store.deliveryRadiusKm);
          }
          if (store?.businessHours && Array.isArray(store.businessHours) && store.businessHours.length > 0) {
            setSchedule(store.businessHours);
          }
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    fetchHours();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleDayOpen = (dayIndex: number) => {
    setSchedule((prev) =>
      prev.map((item, idx) =>
        idx === dayIndex
          ? {
              ...item,
              isOpen: !item.isOpen,
              sessions: !item.isOpen && item.sessions.length === 0 ? [{ open: '09:00', close: '21:00' }] : item.sessions,
            }
          : item
      )
    );
  };

  const toggle24Hours = (dayIndex: number) => {
    setSchedule((prev) =>
      prev.map((item, idx) =>
        idx === dayIndex
          ? {
              ...item,
              is24Hours: !item.is24Hours,
              isOpen: true,
            }
          : item
      )
    );
  };

  const addSession = (dayIndex: number) => {
    setSchedule((prev) =>
      prev.map((item, idx) =>
        idx === dayIndex
          ? {
              ...item,
              sessions: [...item.sessions, { open: '17:00', close: '23:00' }],
            }
          : item
      )
    );
  };

  const removeSession = (dayIndex: number, sessionIndex: number) => {
    setSchedule((prev) =>
      prev.map((item, idx) =>
        idx === dayIndex
          ? {
              ...item,
              sessions: item.sessions.filter((_, sIdx) => sIdx !== sessionIndex),
            }
          : item
      )
    );
  };

  const copyMondayToAll = () => {
    const monday = schedule[0];
    setSchedule(
      DAYS_OF_WEEK.map((day) => ({
        day,
        isOpen: monday.isOpen,
        is24Hours: monday.is24Hours,
        sessions: JSON.parse(JSON.stringify(monday.sessions)),
      }))
    );
    toast.success('Applied Monday schedule to all 7 days!');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await VendorApi.saveOnboardingStep(9, {
        businessHours: schedule,
        deliveryRadiusKm,
      });
      toast.success('Operating hours & delivery coverage saved!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message || 'Failed to save business hours.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading schedule & service area...
        </Text>
      </View>
    );
  }

  return (
    <StepContainer
      icon={<Clock size={24} color={colors.primary} />}
      title="Store Hours & Service Radius"
      subtitle="Define your weekly customer order acceptance window and delivery dispatch radius."
    >
      {/* 1. SERVICE AREA RADIUS */}
      <View style={[styles.radiusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.radiusHeader}>
          <Navigation size={18} color={colors.primary} />
          <Text style={[styles.radiusTitle, { color: colors.textPrimary }]}>
            Store Delivery Radius
          </Text>
        </View>
        <Text style={[styles.radiusSub, { color: colors.textSecondary }]}>
          Maximum geofenced customer distance for direct rapid delivery dispatch.
        </Text>

        <View style={styles.radiusChips}>
          {[3, 5, 8, 10, 15].map((km) => {
            const isSelected = deliveryRadiusKm === km;
            return (
              <TouchableOpacity
                key={km}
                onPress={() => setDeliveryRadiusKm(km)}
                style={[
                  styles.radiusChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.background,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.radiusChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '800' : '600' },
                  ]}
                >
                  {km} km
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.noticeBox, { backgroundColor: colors.background }]}>
          <ShieldAlert size={14} color={colors.textSecondary} />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            Platform fleet boundary enforcement: Actual customer availability also adheres to platform active delivery zones.
          </Text>
        </View>
      </View>

      {/* 2. OPERATING SCHEDULE HEADER & COPY SHORTCUT */}
      <View style={styles.scheduleHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Weekly Schedule</Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Configure standard or multi-session operating hours.
          </Text>
        </View>

        <TouchableOpacity
          onPress={copyMondayToAll}
          style={[styles.copyBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
        >
          <Copy size={12} color={colors.primary} />
          <Text style={[styles.copyBtnText, { color: colors.primary }]}>Apply Monday to All</Text>
        </TouchableOpacity>
      </View>

      {/* 3. 7-DAY SCHEDULE LIST */}
      <View style={styles.daysList}>
        {schedule.map((daySchedule, dayIdx) => {
          const isOpen = daySchedule.isOpen;

          return (
            <View
              key={daySchedule.day}
              style={[
                styles.dayCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isOpen ? colors.primary : colors.border,
                },
              ]}
            >
              {/* Day Header Row */}
              <View style={styles.dayTopRow}>
                <TouchableOpacity
                  onPress={() => toggleDayOpen(dayIdx)}
                  style={styles.dayCheckWrap}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: isOpen ? colors.primary : colors.background,
                        borderColor: isOpen ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {isOpen && <CheckCircle2 size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={[styles.dayName, { color: isOpen ? colors.textPrimary : colors.textSecondary }]}>
                    {daySchedule.day}
                  </Text>
                </TouchableOpacity>

                {isOpen && (
                  <TouchableOpacity
                    onPress={() => toggle24Hours(dayIdx)}
                    style={[
                      styles.toggle24Btn,
                      {
                        backgroundColor: daySchedule.is24Hours ? colors.primaryLight : colors.background,
                        borderColor: daySchedule.is24Hours ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggle24Text,
                        { color: daySchedule.is24Hours ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {daySchedule.is24Hours ? '● Open 24 Hours' : 'Set 24 Hours'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Sessions List */}
              {isOpen && !daySchedule.is24Hours && (
                <View style={styles.sessionsBox}>
                  {daySchedule.sessions.map((session, sIdx) => (
                    <View key={sIdx} style={styles.sessionRow}>
                      <View style={[styles.timeBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Opens</Text>
                        <Text style={[styles.timeVal, { color: colors.textPrimary }]}>{session.open}</Text>
                      </View>

                      <Text style={[styles.timeDash, { color: colors.textSecondary }]}>to</Text>

                      <View style={[styles.timeBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Closes</Text>
                        <Text style={[styles.timeVal, { color: colors.textPrimary }]}>{session.close}</Text>
                      </View>

                      {daySchedule.sessions.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeSession(dayIdx, sIdx)}
                          style={styles.deleteSessionBtn}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}

                  {/* Add Slot Button (e.g. for split shifts) */}
                  <TouchableOpacity
                    onPress={() => addSession(dayIdx)}
                    style={[styles.addSlotBtn, { borderColor: colors.border }]}
                  >
                    <Plus size={12} color={colors.primary} />
                    <Text style={[styles.addSlotText, { color: colors.primary }]}>
                      + Add Lunch / Dinner Session
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Action CTA */}
      <View style={styles.actionsBlock}>
        <Button
          title="Save & Continue"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleSave}
        />
      </View>
    </StepContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  radiusCard: {
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: 20,
    ...Shadows.card,
  },
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  radiusTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  radiusSub: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 12,
  },
  radiusChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  radiusChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  radiusChipText: {
    fontSize: 13,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  noticeText: {
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 11,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  daysList: {
    gap: 10,
    marginBottom: 20,
  },
  dayCard: {
    padding: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  dayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayCheckWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayName: {
    fontSize: 13,
    fontWeight: '800',
  },
  toggle24Btn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  toggle24Text: {
    fontSize: 11,
    fontWeight: '600',
  },
  sessionsBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeBox: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  timeLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
  },
  timeVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  timeDash: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteSessionBtn: {
    padding: 6,
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 4,
  },
  addSlotText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionsBlock: {
    marginTop: 10,
  },
});
