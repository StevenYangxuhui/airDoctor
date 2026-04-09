import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: string;
  name: string;
  category: 'red' | 'yellow' | 'green';
  reason: string;
  diseases: string[];
}

export default function DietSearchScreen() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchDiet = async () => {
    if (!keyword.trim()) {
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/diet-search?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await response.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'red':
        return { label: '禁忌', color: '#EF4444', bgColor: '#FEE2E2', icon: 'circle-xmark' };
      case 'yellow':
        return { label: '少食', color: '#F59E0B', bgColor: '#FEF3C7', icon: 'circle-exclamation' };
      case 'green':
        return { label: '推荐', color: '#10B981', bgColor: '#D1FAE5', icon: 'circle-check' };
      default:
        return { label: '', color: '#6B7280', bgColor: '#F3F4F6', icon: 'circle' };
    }
  };

  const renderItem = ({ item }: { item: SearchResult }) => {
    const categoryInfo = getCategoryInfo(item.category);
    return (
      <View style={styles.resultItem}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultName}>{item.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.bgColor }]}>
            <FontAwesome6 name={categoryInfo.icon as any} size={14} color={categoryInfo.color} />
            <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
              {categoryInfo.label}
            </Text>
          </View>
        </View>
        <Text style={styles.resultReason}>{categoryInfo.label}原因：{item.reason}</Text>
        {item.diseases.length > 0 && (
          <View style={styles.diseaseTags}>
            <Text style={styles.applicableLabel}>适用疾病：</Text>
            {item.diseases.map((disease, index) => (
              <View key={index} style={styles.diseaseTag}>
                <Text style={styles.diseaseText}>{disease}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>饮食/药物查询</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <FontAwesome6 name="magnifying-glass" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="输入食物或药物名称"
            placeholderTextColor="#9CA3AF"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={searchDiet}
            returnKeyType="search"
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => setKeyword('')}>
              <FontAwesome6 name="circle-xmark" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={searchDiet}>
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
      </View>

      {/* 用户病历提示 */}
      {user?.medicalHistory && (
        <View style={styles.historyTip}>
          <FontAwesome6 name="file-medical" size={16} color="#0D9488" />
          <Text style={styles.historyTipText}>
            当前病历：{user.medicalHistory}，查询结果将结合您的病史提供建议
          </Text>
        </View>
      )}

      {/* 搜索结果 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>正在查询...</Text>
        </View>
      ) : hasSearched && results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome6 name="magnifying-glass" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>未找到相关结果</Text>
          <Text style={styles.emptyText}>
            请尝试输入其他食物或药物名称
          </Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.hintContainer}>
          <View style={styles.hintCard}>
            <FontAwesome6 name="lightbulb" size={24} color="#F59E0B" />
            <Text style={styles.hintTitle}>使用说明</Text>
            <Text style={styles.hintText}>
              1. 输入食物名称查询是否适合食用{'\n'}
              2. 输入药物名称查询服用禁忌{'\n'}
              3. 系统将根据您的病历给出个性化建议
            </Text>
          </View>

          <View style={styles.commonSearches}>
            <Text style={styles.commonTitle}>常见查询</Text>
            <View>
              {['盐', '糖', '油', '酒', '咖啡', '茶', '阿司匹林'].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.searchTag}
                  onPress={() => {
                    setKeyword(tag);
                    setTimeout(() => searchDiet(), 100);
                  }}
                >
                  <Text style={styles.searchTagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.disclaimer}>
            <FontAwesome6 name="circle-info" size={16} color="#9CA3AF" />
            <Text style={styles.disclaimerText}>
              本查询结果仅供参考，具体饮食和用药请遵医嘱
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#1F2937',
    marginLeft: 10,
  },
  searchButton: {
    backgroundColor: '#0D9488',
    borderRadius: 16,
    paddingHorizontal: 24,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historyTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  historyTipText: {
    flex: 1,
    fontSize: 13,
    color: '#0D9488',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultReason: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  diseaseTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  applicableLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  diseaseTag: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  diseaseText: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '500',
  },
  hintContainer: {
    flex: 1,
    padding: 20,
  },
  hintCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  hintTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 12,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 22,
    textAlign: 'center',
  },
  commonSearches: {
    marginBottom: 24,
  },
  commonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  searchTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchTagText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 'auto',
    paddingVertical: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
