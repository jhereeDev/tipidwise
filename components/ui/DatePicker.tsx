import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatDate } from '../../lib/formatting';

interface DatePickerProps {
  label?: string;
  value: string; // 'YYYY-MM-DD'
  onChange: (date: string) => void;
  error?: string;
  minDate?: string;
}

export default function DatePicker({ label, value, onChange, error, minDate }: DatePickerProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState(value || toDateString(new Date()));

  function toDateString(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Simple date picker using three number inputs (works cross-platform without native modules)
  const [year, month, day] = (tempDate || toDateString(new Date())).split('-');

  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = [
    { v: '01', l: 'Jan' }, { v: '02', l: 'Feb' }, { v: '03', l: 'Mar' },
    { v: '04', l: 'Apr' }, { v: '05', l: 'May' }, { v: '06', l: 'Jun' },
    { v: '07', l: 'Jul' }, { v: '08', l: 'Aug' }, { v: '09', l: 'Sep' },
    { v: '10', l: 'Oct' }, { v: '11', l: 'Nov' }, { v: '12', l: 'Dec' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 1 + i));

  const confirmDate = () => {
    // Clamp day if needed after month change
    const maxDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const clampedDay = Math.min(parseInt(day), maxDay);
    const finalDate = `${year}-${month}-${String(clampedDay).padStart(2, '0')}`;
    onChange(finalDate);
    setOpen(false);
  };

  return (
    <View>
      {label ? (
        <Text style={[theme.typography.labelLg, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>
          {label}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={() => { setTempDate(value || toDateString(new Date())); setOpen(true); }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          borderWidth: 1.5,
          borderColor: error ? theme.colors.danger[500] : theme.colors.border,
          paddingHorizontal: theme.spacing.md,
          minHeight: 48,
          gap: theme.spacing.sm,
        }}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 16 }}>📅</Text>
        <Text style={[theme.typography.bodyLg, { color: value ? theme.colors.textPrimary : theme.colors.textDisabled, flex: 1 }]}>
          {value ? formatDate(value) : 'Select date'}
        </Text>
      </TouchableOpacity>
      {error ? (
        <Text style={[theme.typography.bodySm, { color: theme.colors.danger[500], marginTop: theme.spacing.xs }]}>
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View
            onStartShouldSetResponder={() => true}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.xl,
              margin: theme.spacing.lg,
              padding: theme.spacing.lg,
              ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24 },
                android: { elevation: 16 },
              }),
            }}
          >
            <Text style={[theme.typography.headingMd, { color: theme.colors.textPrimary, marginBottom: theme.spacing.lg }]}>
              Select Date
            </Text>

            {/* Month row */}
            <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>Month</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.md }}>
              {months.map((m) => (
                <TouchableOpacity
                  key={m.v}
                  onPress={() => setTempDate(`${year}-${m.v}-${day}`)}
                  style={{
                    paddingHorizontal: 10, paddingVertical: 6,
                    borderRadius: theme.radii.md,
                    backgroundColor: month === m.v ? theme.colors.primary[500] : theme.colors.background,
                  }}
                >
                  <Text style={[theme.typography.labelSm, { color: month === m.v ? '#fff' : theme.colors.textPrimary }]}>{m.l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Day row */}
            <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>Day</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.md }}>
              {days.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setTempDate(`${year}-${month}-${d}`)}
                  style={{
                    width: 36, height: 36, borderRadius: theme.radii.md, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: day === d ? theme.colors.primary[500] : theme.colors.background,
                  }}
                >
                  <Text style={[theme.typography.labelSm, { color: day === d ? '#fff' : theme.colors.textPrimary }]}>{parseInt(d)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Year row */}
            <Text style={[theme.typography.labelSm, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>Year</Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.xs, marginBottom: theme.spacing.lg }}>
              {years.map((y) => (
                <TouchableOpacity
                  key={y}
                  onPress={() => setTempDate(`${y}-${month}-${day}`)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 8,
                    borderRadius: theme.radii.md,
                    backgroundColor: year === y ? theme.colors.primary[500] : theme.colors.background,
                  }}
                >
                  <Text style={[theme.typography.labelLg, { color: year === y ? '#fff' : theme.colors.textPrimary }]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                style={{ flex: 1, alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.radii.md, backgroundColor: theme.colors.background }}
              >
                <Text style={[theme.typography.labelLg, { color: theme.colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDate}
                style={{ flex: 1, alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.radii.md, backgroundColor: theme.colors.primary[500] }}
              >
                <Text style={[theme.typography.labelLg, { color: '#fff' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
});
