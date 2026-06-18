import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const featuredTools = [
  { id: 'loan', name: 'محاسبه وام', icon: '💰', category: 'مالی' },
  { id: 'salary', name: 'محاسبه حقوق', icon: '💵', category: 'مالی' },
  { id: 'currency', name: 'مبدل ارز', icon: '💱', category: 'مالی' },
  { id: 'pdf-merge', name: 'ادغام PDF', icon: '📄', category: 'PDF' },
  { id: 'image-compress', name: 'فشرده‌سازی تصویر', icon: '🖼️', category: 'تصویر' },
  { id: 'date-converter', name: 'تبدیل تاریخ', icon: '📅', category: 'تاریخ' },
];

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>جعبه ابزار فارسی</Text>
          <Text style={styles.subtitle}>ابزارهای کاربردی برای زندگی روزمره</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ابزارهای ویژه</Text>
          <View style={styles.toolsGrid}>
            {featuredTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={() => navigation.navigate('ToolDetail', { toolId: tool.id })}
              >
                <Text style={styles.toolIcon}>{tool.icon}</Text>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolCategory}>{tool.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دسته‌بندی‌ها</Text>
          <View style={styles.categories}>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>📄</Text>
              <Text style={styles.categoryName}>ابزارهای PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>💰</Text>
              <Text style={styles.categoryName}>ابزارهای مالی</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>🖼️</Text>
              <Text style={styles.categoryName}>ابزارهای تصویر</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>📅</Text>
              <Text style={styles.categoryName}>ابزارهای تاریخ</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#6366f1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  toolCategory: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
});
