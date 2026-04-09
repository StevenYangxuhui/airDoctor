import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

interface DietItem {
  id: string;
  name: string;
  category: 'red' | 'yellow' | 'green';
  reason: string;
  diseases: string[];
}

const DietScreen = () => {
  const router = useSafeRouter();
  const [items, setItems] = useState<DietItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');

  const fetchDietList = async () => {
    try {
      const category = activeFilter === 'all' ? '' : activeFilter;
      const url = category
        ? `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/diet-list?category=${category}`
        : `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/diet-list`;
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch diet list:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDietList();
    }, [activeFilter])
  );

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'red':
        return { label: '禁忌', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: 'circle-xmark' };
      case 'yellow':
        return { label: '少食', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', icon: 'circle-exclamation' };
      case 'green':
        return { label: '推荐', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)', icon: 'circle-check' };
      default:
        return { label: '', color: '#6B7280', bgColor: '#F3F4F6', icon: 'circle' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 顶部区域 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>饮食红绿灯</Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push('/diet-search', {})}
          >
            <FontAwesome6 name="magnifying-glass" size={20} color="#0D9488" />
          </TouchableOpacity>
        </View>

        {/* 说明卡片 */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.infoItem, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <FontAwesome6 name="circle-xmark" size={20} color="#EF4444" />
              <Text style={styles.infoText}>红灯{'\n'}忌食</Text>
            </View>
            <View style={[styles.infoItem, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <FontAwesome6 name="circle-exclamation" size={20} color="#F59E0B" />
              <Text style={styles.infoText}>黄灯{'\n'}少食</Text>
            </View>
            <View style={[styles.infoItem, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <FontAwesome6 name="circle-check" size={20} color="#10B981" />
              <Text style={styles.infoText}>绿灯{'\n'}推荐</Text>
            </View>
          </View>
        </View>

        {/* 筛选标签 */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {[
              { key: 'all', label: '全部' },
              { key: 'red', label: '红灯禁忌', color: '#EF4444' },
              { key: 'yellow', label: '黄灯少食', color: '#F59E0B' },
              { key: 'green', label: '绿灯推荐', color: '#10B981' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTag,
                  activeFilter === filter.key && styles.filterTagActive,
                  filter.key !== 'all' && activeFilter !== filter.key && styles.filterTagInactive,
                ]}
                onPress={() => setActiveFilter(filter.key as any)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter.key && styles.filterTextActive,
                    filter.key !== 'all' && { color: filter.color },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 饮食列表 */}
        <View style={styles.listContainer}>
          {items.map((item) => {
            const categoryInfo = getCategoryInfo(item.category);
            return (
              <View key={item.id} style={styles.dietItem}>
                <View style={styles.dietLeft}>
                  <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.bgColor }]}>
                    <FontAwesome6 name={categoryInfo.icon as any} size={18} color={categoryInfo.color} />
                  </View>
                  <View style={styles.dietInfo}>
                    <Text style={styles.dietName}>{item.name}</Text>
                    <Text style={styles.dietReason}>{categoryInfo.label}原因：{item.reason}</Text>
                    {item.diseases.length > 0 && (
                      <View style={styles.diseaseTags}>
                        {item.diseases.slice(0, 2).map((disease, index) => (
                          <View key={index} style={styles.diseaseTag}>
                            <Text style={styles.diseaseText}>{disease}</Text>
                          </View>
                        ))}
                        {item.diseases.length > 2 && (
                          <Text style={styles.moreText}>+{item.diseases.length - 2}</Text>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* 提示 */}
        <View style={styles.tipCard}>
          <FontAwesome6 name="circle-info" size={18} color="#0D9488" />
          <Text style={styles.tipText}>
            点击"饮食查询"可搜索具体食物或药物与当前病历的相克情况
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    minWidth: 80,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  filterContainer: {
    marginBottom: 20,
    gap: 10,
  },
  filterTag: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  filterTagActive: {
    backgroundColor: '#0D9488',
  },
  filterTagInactive: {
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    gap: 12,
  },
  dietItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  dietLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dietInfo: {
    flex: 1,
  },
  dietName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  dietReason: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  diseaseTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  diseaseTag: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  diseaseText: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#0D9488',
    lineHeight: 20,
  },
});

export default DietScreen;
