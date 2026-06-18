import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const allTools = [
  { id: 'loan', name: 'محاسبه وام', icon: '💰', category: 'مالی' },
  { id: 'salary', name: 'محاسبه حقوق', icon: '💵', category: 'مالی' },
  { id: 'interest', name: 'سود بانکی', icon: '🏦', category: 'مالی' },
  { id: 'currency', name: 'مبدل ارز', icon: '💱', category: 'مالی' },
  { id: 'inflation', name: 'محاسبه تورم', icon: '📉', category: 'مالی' },
  { id: 'investment', name: 'سرمایه‌گذاری', icon: '📈', category: 'مالی' },
  { id: 'pdf-merge', name: 'ادغام PDF', icon: '📄', category: 'PDF' },
  { id: 'pdf-split', name: 'تقسیم PDF', icon: '✂️', category: 'PDF' },
  { id: 'pdf-compress', name: 'فشرده‌سازی PDF', icon: '📦', category: 'PDF' },
  { id: 'pdf-to-excel', name: 'PDF به Excel', icon: '📊', category: 'PDF' },
  { id: 'pdf-page-numbers', name: 'شماره صفحه', icon: '🔢', category: 'PDF' },
  { id: 'image-compress', name: 'فشرده‌سازی تصویر', icon: '🖼️', category: 'تصویر' },
  { id: 'image-format', name: 'تبدیل فرمت', icon: '🔄', category: 'تصویر' },
  { id: 'image-bg-remove', name: 'حذف پس‌زمینه', icon: '✂️', category: 'تصویر' },
  { id: 'date-converter', name: 'تبدیل تاریخ', icon: '📅', category: 'تاریخ' },
  { id: 'date-calc', name: 'محاسبه فاصله تاریخ', icon: '📆', category: 'تاریخ' },
  { id: 'age-calc', name: 'محاسبه سن', icon: '🎂', category: 'تاریخ' },
  { id: 'text-count', name: 'شمارش کلمات', icon: '📝', category: 'متنی' },
  { id: 'number-text', name: 'عدد به حروف', icon: '🔢', category: 'متنی' },
  { id: 'address-convert', name: 'تبدیل آدرس', icon: '📍', category: 'متنی' },
];

const categories = ['همه', 'مالی', 'PDF', 'تصویر', 'تاریخ', 'متنی'];

export default function ToolsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');

  const filteredTools = allTools.filter((tool) => {
    const matchesSearch = tool.name.includes(search);
    const matchesCategory = selectedCategory === 'همه' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ابزارها</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="جستجوی ابزار..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal style={styles.categoriesScroll} showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.toolsList}>
        {filteredTools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={styles.toolItem}
            onPress={() => navigation.navigate('ToolDetail', { toolId: tool.id })}
          >
            <Text style={styles.toolItemIcon}>{tool.icon}</Text>
            <View style={styles.toolItemInfo}>
              <Text style={styles.toolItemName}>{tool.name}</Text>
              <Text style={styles.toolItemCategory}>{tool.category}</Text>
            </View>
            <Text style={styles.arrow}>←</Text>
          </TouchableOpacity>
        ))}
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
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  categoriesScroll: {
    maxHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#6366f1',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748b',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  toolsList: {
    flex: 1,
    padding: 16,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toolItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  toolItemInfo: {
    flex: 1,
  },
  toolItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  toolItemCategory: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#94a3b8',
  },
});
