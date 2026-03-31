import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function Select({ label, placeholder = 'Select...', options, value, onChange, error }: SelectProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      {label ? (
        <Text style={[theme.typography.labelLg, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>
          {label}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          borderWidth: 1.5,
          borderColor: error ? theme.colors.danger[500] : theme.colors.border,
          paddingHorizontal: theme.spacing.md,
          minHeight: 48,
        }}
        activeOpacity={0.7}
      >
        <Text style={[theme.typography.bodyLg, { color: selected ? theme.colors.textPrimary : theme.colors.textDisabled, flex: 1 }]}>
          {selected ? `${selected.icon ? selected.icon + ' ' : ''}${selected.label}` : placeholder}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>▼</Text>
      </TouchableOpacity>
      {error ? (
        <Text style={[theme.typography.bodySm, { color: theme.colors.danger[500], marginTop: theme.spacing.xs }]}>
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.xl,
              margin: theme.spacing.lg,
              maxHeight: 400,
              overflow: 'hidden',
              ...Platform.select({
                ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24 },
                android: { elevation: 16 },
              }),
            }}
          >
            {label ? (
              <Text style={[theme.typography.headingSm, { color: theme.colors.textPrimary, padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
                {label}
              </Text>
            ) : null}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { onChange(item.value); setOpen(false); }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    backgroundColor: item.value === value ? `${theme.colors.primary[500]}15` : 'transparent',
                  }}
                  activeOpacity={0.7}
                >
                  {item.icon ? <Text style={{ fontSize: 18, marginRight: theme.spacing.sm }}>{item.icon}</Text> : null}
                  <Text style={[theme.typography.bodyLg, { color: theme.colors.textPrimary, flex: 1 }]}>{item.label}</Text>
                  {item.value === value ? <Text style={{ color: theme.colors.primary[500] }}>✓</Text> : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
});
