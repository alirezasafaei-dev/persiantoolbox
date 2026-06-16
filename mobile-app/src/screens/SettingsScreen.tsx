import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const handleClearData = () => {
    Alert.alert(
      'پاک کردن داده‌ها',
      'آیا مطمئن هستید؟ تمام داده‌های محلی پاک می‌شوند.',
      [
        {text: 'لغو', style: 'cancel'},
        {
          text: 'پاک کردن',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('موفق', 'داده‌ها پاک شدند');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>تنظیمات</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عمومی</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>اعلان‌ها</Text>
              <Text style={styles.settingDescription}>دریافت اعلان درباره به‌روزرسانی‌ها</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{false: '#cbd5e1', true: '#818cf8'}}
              thumbColor={notifications ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>حالت تاریک</Text>
              <Text style={styles.settingDescription}>فعال‌سازی تم تاریک</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{false: '#cbd5e1', true: '#818cf8'}}
              thumbColor={darkMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>ذخیره خودکار</Text>
              <Text style={styles.settingDescription}>ذخیره خودکار نتایج محاسبات</Text>
            </View>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              trackColor={{false: '#cbd5e1', true: '#818cf8'}}
              thumbColor={autoSave ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>داده‌ها</Text>

          <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
            <Text style={styles.dangerButtonText}>پاک کردن تمام داده‌ها</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>درباره</Text>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>نسخه</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>سازنده</Text>
            <Text style={styles.aboutValue}>PersianToolbox</Text>
          </View>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>وبسایت</Text>
            <Text style={styles.aboutValue}>persiantoolbox.ir</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  aboutLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
});
