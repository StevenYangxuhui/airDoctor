import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';

interface FoodItem {
  name: string;
  category: 'green' | 'yellow' | 'red';
  reason?: string;
}

const DietScreen = () => {
  const router = useSafeRouter();

  // 示例饮食建议数据
  const dietTips = [
    {
      title: '低盐饮食',
      desc: '每日盐摄入量不超过6克，减少腌制食品',
      icon: 'shaker',
      color: '#0D9488',
    },
    {
      title: '控制糖分',
      desc: '减少甜食和含糖饮料，选择天然食材',
      icon: 'candy-cane',
      color: '#F59E0B',
    },
    {
      title: '优质蛋白',
      desc: '多吃鱼、禽、蛋、奶和大豆制品',
      icon: 'fish',
      color: '#3B82F6',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>饮食红绿灯</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 搜索入口 */}
        <TouchableOpacity
          style={styles.searchCard}
          onPress={() => router.push('/diet-search', {})}
        >
          <View style={styles.searchLeft}>
            <FontAwesome6 name="magnifying-glass" size={20} color="#9CA3AF" />
            <Text style={styles.searchText}>搜索食物，查看禁忌</Text>
          </View>
          <FontAwesome6 name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* 饮食原则 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>饮食原则</Text>
        </View>

        <View style={styles.tipsContainer}>
          {dietTips.map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <View style={[styles.tipIcon, { backgroundColor: `${tip.color}15` }]}>
                <FontAwesome6 name={tip.icon as any} size={24} color={tip.color} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 红绿灯说明 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>饮食禁忌等级</Text>
        </View>

        <View style={styles.legendContainer}>
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

        {/* 常见食物示例 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>常见食物示例</Text>
        </View>

        <View style={styles.foodList}>
          <View style={[styles.foodCard, styles.foodGreen]}>
            <FontAwesome6 name="apple-whole" size={28} color="#10B981" />
            <Text style={styles.foodName}>新鲜水果</Text>
            <Text style={styles.foodTag}>绿灯</Text>
          </View>

          <View style={[styles.foodCard, styles.foodYellow]}>
            <FontAwesome6 name="egg" size={28} color="#F59E0B" />
            <Text style={styles.foodName}>鸡蛋</Text>
            <Text style={styles.foodTag}>黄灯</Text>
          </View>

          <View style={[styles.foodCard, styles.foodRed]}>
            <FontAwesome6 name="burger" size={28} color="#EF4444" />
            <Text style={styles.foodName}>油炸食品</Text>
            <Text style={styles.foodTag}>红灯</Text>
          </View>

          <View style={[styles.foodCard, styles.foodGreen]}>
            <FontAwesome6 name="carrot" size={28} color="#10B981" />
            <Text style={styles.foodName}>新鲜蔬菜</Text>
            <Text style={styles.foodTag}>绿灯</Text>
          </View>

          <View style={[styles.foodCard, styles.foodYellow]}>
            <FontAwesome6 name="bread-slice" size={28} color="#F59E0B" />
            <Text style={styles.foodName}>白面包</Text>
            <Text style={styles.foodTag}>黄灯</Text>
          </View>

          <View style={[styles.foodCard, styles.foodRed]}>
            <FontAwesome6 name="bacon" size={28} color="#EF4444" />
            <Text style={styles.foodName}>腌制肉类</Text>
            <Text style={styles.foodTag}>红灯</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 12,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  tipsContainer: {
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: '#4B5563',
  },
  foodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  foodCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    margin: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  foodGreen: {
    borderTopWidth: 4,
    borderTopColor: '#10B981',
  },
  foodYellow: {
    borderTopWidth: 4,
    borderTopColor: '#F59E0B',
  },
  foodRed: {
    borderTopWidth: 4,
    borderTopColor: '#EF4444',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  foodTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
});

export default DietScreen;
