import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
import { Clock, Calendar, Info, ChevronDown, Check, X, Sparkles, Sun, Moon, Zap } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { StepContainer } from '../../components/onboarding/StepContainer';
import { useOnboardingStore } from '../../store/onboardingStore';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const START_TIMES = [
  '06:00 AM',
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
];

const END_TIMES = [
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
  '09:00 PM',
  '10:00 PM',
  '11:00 PM',
  '12:00 AM',
];

const SHIFT_TEMPLATES = [
  { label: 'Morning', time: '07:00 AM - 03:00 PM', start: '07:00 AM', end: '03:00 PM', icon: Sun },
  { label: 'General', time: '09:00 AM - 06:00 PM', start: '09:00 AM', end: '06:00 PM', icon: Zap },
  { label: 'Evening Peak', time: '02:00 PM - 10:00 PM', start: '02:00 PM', end: '10:00 PM', icon: Moon },
  { label: 'Full Day', time: '08:00 AM - 08:00 PM', start: '08:00 AM', end: '08:00 PM', icon: Sparkles },
];

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
  slots: string[];
}

export const AvailabilityStepScreen = ({ navigation }: any) => {
  const { draftData, completionPercentage, saveSection, isSaving, error, clearError } =
    useOnboardingStore();

  const parseInitialSchedule = (): Record<string, DaySchedule> => {
    const raw = draftData?.availability?.weeklySchedule;
    const initial: Record<string, DaySchedule> = {};

    DAYS.forEach((day) => {
      const dayRaw = raw?.[day.key];
      const isEnabled = dayRaw?.enabled ?? (day.key !== 'sunday');
      let start = '08:00 AM';
      let end = '08:00 PM';

      if (dayRaw?.slots && dayRaw.slots.length > 0) {
        const parts = dayRaw.slots[0].split('-');
        if (parts.length === 2) {
          start = parts[0].trim() || '08:00 AM';
          end = parts[1].trim() || '08:00 PM';
          if (!start.includes('AM') && !start.includes('PM')) start += ' AM';
          if (!end.includes('AM') && !end.includes('PM')) end += ' PM';
        }
      }

      initial[day.key] = {
        enabled: isEnabled,
        startTime: start,
        endTime: end,
        slots: isEnabled ? [`${start}-${end}`] : [],
      };
    });

    return initial;
  };

  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(parseInitialSchedule);

  // Time Picker Bottom Sheet State
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    dayKey: string;
    field: 'startTime' | 'endTime';
    currentValue: string;
  }>({
    visible: false,
    dayKey: '',
    field: 'startTime',
    currentValue: '',
  });

  const toggleDay = (dayKey: string, enabled: boolean) => {
    setSchedule((prev) => {
      const current = prev[dayKey];
      return {
        ...prev,
        [dayKey]: {
          ...current,
          enabled,
          slots: enabled ? [`${current.startTime}-${current.endTime}`] : [],
        },
      };
    });
  };

  const openTimePicker = (dayKey: string, field: 'startTime' | 'endTime') => {
    setPickerModal({
      visible: true,
      dayKey,
      field,
      currentValue: schedule[dayKey]?.[field] || (field === 'startTime' ? '08:00 AM' : '08:00 PM'),
    });
  };

  const selectTime = (time: string) => {
    const { dayKey, field } = pickerModal;
    if (!dayKey) return;

    setSchedule((prev) => {
      const current = prev[dayKey];
      const updated = {
        ...current,
        [field]: time,
      };
      return {
        ...prev,
        [dayKey]: {
          ...updated,
          slots: updated.enabled ? [`${updated.startTime}-${updated.endTime}`] : [],
        },
      };
    });

    setPickerModal((prev) => ({ ...prev, visible: false }));
  };

  const applyTemplateToAllDays = (start: string, end: string) => {
    setSchedule((prev) => {
      const updated: Record<string, DaySchedule> = {};
      Object.keys(prev).forEach((key) => {
        const item = prev[key];
        updated[key] = {
          ...item,
          startTime: start,
          endTime: end,
          slots: item.enabled ? [`${start}-${end}`] : [],
        };
      });
      return updated;
    });
  };

  const calculateHours = (start: string, end: string): string => {
    try {
      const parseHour = (timeStr: string) => {
        const [time, period] = timeStr.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h + (m || 0) / 60;
      };
      let diff = parseHour(end) - parseHour(start);
      if (diff <= 0) diff += 24;
      return `${Math.round(diff * 10) / 10} hrs`;
    } catch {
      return '12 hrs';
    }
  };

  const onSubmit = async () => {
    clearError();
    const weeklySchedule: Record<string, { enabled: boolean; slots: string[] }> = {};
    Object.keys(schedule).forEach((key) => {
      const item = schedule[key];
      weeklySchedule[key] = {
        enabled: item.enabled,
        slots: item.enabled && item.startTime && item.endTime ? [`${item.startTime}-${item.endTime}`] : [],
      };
    });

    const payload = { weeklySchedule };
    const success = await saveSection('availability', payload, true);
    if (success) {
      navigation.navigate('OnboardingReview');
    }
  };

  const handleSaveExit = async () => {
    const weeklySchedule: Record<string, { enabled: boolean; slots: string[] }> = {};
    Object.keys(schedule).forEach((key) => {
      const item = schedule[key];
      weeklySchedule[key] = {
        enabled: item.enabled,
        slots: item.enabled && item.startTime && item.endTime ? [`${item.startTime}-${item.endTime}`] : [],
      };
    });

    await saveSection('availability', { weeklySchedule }, false);
    navigation.navigate('OnboardingResume');
  };

  return (
    <OnboardingLayout
      currentStep={12}
      totalSteps={14}
      stepTitle="Working Hours & Availability"
      completionPercentage={completionPercentage}
      onBack={() => navigation.navigate('OnboardingPreferences')}
      onSaveContinue={onSubmit}
      onSaveExit={handleSaveExit}
      isLoading={isSaving}
    >
      <StepContainer
        title="Weekly Preferred Shifts"
        subtitle="Set your preferred working hours for each day. Customize standard starting and ending operational times."
        error={error}
      >
        {/* Important operational status disclaimer */}
        <View style={styles.infoBanner}>
          <Info size={18} color="#FF6600" />
          <Text style={styles.infoBannerText}>
            This preferred schedule is for fleet shift planning. Your active operational status
            (Online / Offline) is always under your 100% control on the Home screen.
          </Text>
        </View>

        {/* Quick Shift Templates */}
        <View style={styles.templatesSection}>
          <Text style={styles.templatesTitle}>Quick Shift Presets (Apply to All Days):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templatesScroll}>
            {SHIFT_TEMPLATES.map((tmpl) => {
              const Icon = tmpl.icon;
              return (
                <TouchableOpacity
                  key={tmpl.label}
                  style={styles.templateChip}
                  onPress={() => applyTemplateToAllDays(tmpl.start, tmpl.end)}
                  activeOpacity={0.7}
                >
                  <Icon size={14} color="#FF6600" />
                  <Text style={styles.templateLabel}>{tmpl.label}</Text>
                  <Text style={styles.templateTime}>{tmpl.time}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Monday to Sunday Day Cards */}
        <View style={styles.daysList}>
          {DAYS.map((day) => {
            const dayData = schedule[day.key] || {
              enabled: false,
              startTime: '08:00 AM',
              endTime: '08:00 PM',
              slots: [],
            };
            const shiftDuration = calculateHours(dayData.startTime, dayData.endTime);

            return (
              <View key={day.key} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayTitleRow}>
                    <Calendar size={16} color={dayData.enabled ? '#FF6600' : Colors.textMuted} />
                    <Text style={[styles.dayTitle, !dayData.enabled && styles.dayTitleDisabled]}>
                      {day.label}
                    </Text>
                    {dayData.enabled && (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{shiftDuration}</Text>
                      </View>
                    )}
                  </View>

                  <Switch
                    value={dayData.enabled}
                    onValueChange={(val) => toggleDay(day.key, val)}
                    trackColor={{ false: Colors.surfaceElevated, true: '#10B981' }}
                    thumbColor={dayData.enabled ? '#FFFFFF' : '#94A3B8'}
                  />
                </View>

                {dayData.enabled ? (
                  <View style={styles.timeRowContainer}>
                    {/* Starting Time Selector */}
                    <View style={styles.timeCol}>
                      <Text style={styles.timeLabel}>Starting Time</Text>
                      <TouchableOpacity
                        style={styles.timeSelectorCard}
                        onPress={() => openTimePicker(day.key, 'startTime')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.timeIconWrapOrange}>
                          <Clock size={16} color="#FF6600" />
                        </View>
                        <View style={styles.timeTextCol}>
                          <Text style={styles.timeValueText}>{dayData.startTime}</Text>
                        </View>
                        <ChevronDown size={16} color={Colors.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    {/* Ending Time Selector */}
                    <View style={styles.timeCol}>
                      <Text style={styles.timeLabel}>Ending Time</Text>
                      <TouchableOpacity
                        style={styles.timeSelectorCard}
                        onPress={() => openTimePicker(day.key, 'endTime')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.timeIconWrapGreen}>
                          <Clock size={16} color="#10B981" />
                        </View>
                        <View style={styles.timeTextCol}>
                          <Text style={styles.timeValueText}>{dayData.endTime}</Text>
                        </View>
                        <ChevronDown size={16} color={Colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.offDayNotice}>
                    <Text style={styles.offDayNoticeText}>Off Duty (No active shift)</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Professional Time Picker Bottom Sheet Modal */}
        <Modal
          visible={pickerModal.visible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setPickerModal((prev) => ({ ...prev, visible: false }))}
        >
          <TouchableWithoutFeedback onPress={() => setPickerModal((prev) => ({ ...prev, visible: false }))}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.sheetContainer}>
                  {/* Drag Handle */}
                  <View style={styles.handleBar} />

                  <View style={styles.sheetHeader}>
                    <View>
                      <Text style={styles.sheetTitle}>
                        Select {pickerModal.field === 'startTime' ? 'Starting Time' : 'Ending Time'}
                      </Text>
                      <Text style={styles.sheetSubtitle}>
                        Choose standard operational time slot
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.closeBtn}
                      onPress={() => setPickerModal((prev) => ({ ...prev, visible: false }))}
                    >
                      <X size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.optionsScrollView} contentContainerStyle={styles.optionsGrid}>
                    {(pickerModal.field === 'startTime' ? START_TIMES : END_TIMES).map((timeOption) => {
                      const isSelected = pickerModal.currentValue === timeOption;
                      return (
                        <TouchableOpacity
                          key={timeOption}
                          style={[
                            styles.timeOptionCard,
                            isSelected && (pickerModal.field === 'startTime' ? styles.timeOptionCardActiveOrange : styles.timeOptionCardActiveGreen),
                          ]}
                          onPress={() => selectTime(timeOption)}
                          activeOpacity={0.7}
                        >
                          <Clock
                            size={16}
                            color={isSelected ? (pickerModal.field === 'startTime' ? '#FF6600' : '#10B981') : Colors.textMuted}
                          />
                          <Text
                            style={[
                              styles.timeOptionText,
                              isSelected && (pickerModal.field === 'startTime' ? styles.timeOptionTextActiveOrange : styles.timeOptionTextActiveGreen),
                            ]}
                          >
                            {timeOption}
                          </Text>
                          {isSelected && (
                            <Check
                              size={16}
                              color={pickerModal.field === 'startTime' ? '#FF6600' : '#10B981'}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </StepContainer>
    </OnboardingLayout>
  );
};

const styles = StyleSheet.create({
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  infoBannerText: {
    ...Typography.bodySmall,
    color: '#9A3412',
    flex: 1,
    lineHeight: 18,
  },
  templatesSection: {
    marginBottom: Spacing.lg,
  },
  templatesTitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  templatesScroll: {
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  templateLabel: {
    ...Typography.bodySmall,
    color: '#EA580C',
    fontWeight: '700',
    fontSize: 12,
  },
  templateTime: {
    ...Typography.bodySmall,
    color: '#9A3412',
    fontSize: 11,
  },
  daysList: {
    gap: Spacing.md,
  },
  dayCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dayTitle: {
    ...Typography.titleSmall,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  dayTitleDisabled: {
    color: Colors.textMuted,
  },
  durationBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  timeRowContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timeCol: {
    flex: 1,
  },
  timeLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  timeSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  timeIconWrapOrange: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeIconWrapGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeTextCol: {
    flex: 1,
  },
  timeValueText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  offDayNotice: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  offDayNoticeText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontStyle: 'italic',
    fontSize: 12,
  },
  // Modal Bottom Sheet Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '75%',
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
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  optionsScrollView: {
    maxHeight: 360,
  },
  optionsGrid: {
    gap: 8,
    paddingBottom: 16,
  },
  timeOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  timeOptionCardActiveOrange: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6600',
  },
  timeOptionCardActiveGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  timeOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timeOptionTextActiveOrange: {
    color: '#EA580C',
    fontWeight: '800',
  },
  timeOptionTextActiveGreen: {
    color: '#065F46',
    fontWeight: '800',
  },
});

export default AvailabilityStepScreen;
