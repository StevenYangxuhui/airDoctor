import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';

interface FoodItem {
  name: string;
  category: 'green' | 'yellow' | 'red';
  reason: string;
  advice: string;
}

// 模拟食物数据库
const foodDatabase: FoodItem[] = [
  {
    name: '苹果',
    category: 'green',
    reason: '富含维生素和膳食纤维',
    advice: '建议每日食用1-2个',
  },
  {
    name: '香蕉',
    category: 'green',
    reason: '富含钾元素',
    advice: '适量食用，注意糖分摄入',
  },
  {
    name: '菠菜',
    category: 'green',
    reason: '富含叶酸和铁元素',
    advice: '烹饪前焯水去除草酸',
  },
  {
    name: '鸡蛋',
    category: 'yellow',
    reason: '富含优质蛋白，但胆固醇较高',
    advice: '每日1个为宜',
  },
  {
    name: '牛奶',
    category: 'yellow',
    reason: '富含钙质，但乳糖不耐者慎用',
    advice: '选择低脂或脱脂牛奶',
  },
  {
    name: '米饭',
    category: 'yellow',
    reason: '主要碳水化合物来源',
    advice: '控制食用量，搭配蔬菜',
  },
  {
    name: '油炸食品',
    category: 'red',
    reason: '高热量、高脂肪，增加心血管负担',
    advice: '尽量避免食用',
  },
  {
    name: '腌制食品',
    category: 'red',
    reason: '高盐，不利于血压控制',
    advice: '避免或限制食用',
  },
  {
    name: '甜点',
    category: 'red',
    reason: '高糖分，影响血糖控制',
    advice: '糖尿病及高血糖人群避免食用',
  },
  {
    name: '肥肉',
    category: 'red',
    reason: '高饱和脂肪，增加胆固醇',
    advice: '避免食用，选择瘦肉',
  },
];

const DietSearchScreen = () => {
  const router = useSafeRouter();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = foodDatabase.filter((food) =>
      food.name.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'green':
        return {
          label: '绿灯',
          color: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.12)',
          icon: 'check-circle',
        };
      case 'yellow':
        return {
          label: '黄灯',
          color: '#F59E0B',
          bgColor: 'rgba(245, 158, 11, 0.12)',
          icon: 'exclamation-circle',
        };
      case 'red':
        return {
          label: '红灯',
          color: '#EF4444',
          bgColor: 'rgba(239, 68, 68, 0.12)',
          icon: 'xmark-circle',
        };
      default:
        return {
          label: '未知',
          color: '#9CA3AF',
          bgColor: 'rgba(156, 163, 175, 0.12)',
          icon: 'question-circle',
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome6 name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>饮食搜索</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 搜索框 */}
        <View style={styles.searchContainer}>
          <FontAwesome6 name="magnifying-glass" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索食物名称"
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchText ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <FontAwesome6 name="xmark" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 图例说明 */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>饮食禁忌等级</Text>
          <View style={styles.legendList}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>绿灯：可以适量食用</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>黄灯：少量食用</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>红灯：避免食用</Text>
            </View>
          </View>
        </View>

        {/* 搜索结果 */}
        {searchResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              找到 {searchResults.length} 个结果
            </Text>
            {searchResults.map((food, index) => {
              const categoryInfo = getCategoryInfo(food.category);
              return (
                <View key={index} style={styles.foodCard}>
                  <View style={styles.foodHeader}>
                    <View style={styles.foodNameContainer}>
                      <FontAwesome6 name="utensils" size={18} color="#0D9488" />
                      <Text style={styles.foodName}>{food.name}</Text>
                    </View>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: categoryInfo.bgColor },
                      ]}
                    >
                      <FontAwesome6
                        name={categoryInfo.icon as any}
                        size={14}
                        color={categoryInfo.color}
                      />
                      <Text
                        style={[styles.categoryLabel, { color: categoryInfo.color }]}
                      >
                        {categoryInfo.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.foodDetail}>
                    <Text style={styles.detailLabel}>食物特性:</Text>
                    <Text style={styles.detailText}>{food.reason}</Text>
                  </View>

                  <View style={styles.foodDetail}>
                    <Text style={styles.detailLabel}>食用建议:</Text>
                    <Text style={styles.detailText}>{food.advice}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : searchText ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="search" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>未找到相关食物</Text>
            <Text style={styles.emptyHint}>尝试搜索其他关键词</Text>
          </View>
        ) : (
          <View style={styles.initialContainer}>
            <FontAwesome6 name="magnifying-glass" size={64} color="#0D948833" />
            <Text style={styles.initialText}>输入食物名称</Text>
            <Text style={styles.initialHint}>查看饮食禁忌和建议</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginHorizontal: 12,
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  legendList: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultsContainer: {
    gap: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  foodNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  foodDetail: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  initialContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  initialText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0D9488',
    marginTop: 16,
    marginBottom: 8,
  },
  initialHint: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default DietSearchScreen;
