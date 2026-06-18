import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@favorites';

export default function FavoritesScreen({ navigation }: any) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const favoriteTools = [
    { id: 'loan', name: 'محاسبه وام', icon: '💰' },
    { id: 'salary', name: 'محاسبه حقوق', icon: '💵' },
    { id: 'currency', name: 'مبدل ارز', icon: '💱' },
    { id: 'pdf-merge', name: 'ادغام PDF', icon: '📄' },
    { id: 'image-compress', name: 'فشرده‌سازی تصویر', icon: '🖼️' },
    { id: 'date-converter', name: 'تبدیل تاریخ', icon: '📅' },
  ].filter((tool) => favorites.includes(tool.id));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>علاقه‌مندی‌ها</Text>
        <Text style={styles.subtitle}>ابزارهای مورد علاقه شما</Text>
      </View>

      {favoriteTools.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>هنوز ابزاری اضافه نشده</Text>
          <Text style={styles.emptySubtext}>
            از بخش ابزارها، ابزارهای مورد علاقه خود را اضافه کنید
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteTools}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.favoriteItem}
              onPress={() => navigation.navigate('ToolDetail', { toolId: item.id })}
            >
              <Text style={styles.favoriteIcon}>{item.icon}</Text>
              <Text style={styles.favoriteName}>{item.name}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  setFavorites((favs) => favs.filter((id) => id !== item.id));
                  AsyncStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(favorites.filter((id) => id !== item.id)),
                  );
                }}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
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
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  favoriteItem: {
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
  favoriteIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  favoriteName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: 'bold',
  },
});
