import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface HealthRecord {
  id: string;
  type: 'bloodPressure' | 'bloodSugar';
  value: number;
  secondaryValue?: number;
  recordDate: string;
}

const { width } = Dimensions.get('window');

const RecordsScreen = () => {
  const router = useSafeRouter();
  const { userId } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'bloodPressure' | 'bloodSugar'>('bloodPressure');

  const fetchRecords = async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/health-records/${userId}?type=${activeTab}&limit=30`
      );
      const data = await response.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [userId, activeTab])
  );

  const chartData = useMemo(() => {
    const data: any[] = [];
    const days = 7;
    // 使用固定值避免在渲染期间调用 Date.now()
    const baseValues = [5, 8, 12, 3, 15, 7, 10];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      if (activeTab === 'bloodPressure') {
        data.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          high: 120 + (baseValues[i] % 20),
          low: 75 + (baseValues[(i + 3) % 7] % 15),
        });
      } else {
        data.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          value: 5 + (baseValues[i] % 3),
        });
      }
    }
    return data;
  }, [activeTab]);

  const renderBloodPressureChart = () => {
    const maxHigh = 160;
    const maxLow = 100;
    const chartHeight = 120;
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {chartData.map((item, index) => {
            const highHeight = (item.high / maxHigh) * chartHeight;
            const lowHeight = (item.low / maxLow) * chartHeight;
            return (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barGroup}>
                  <View
                    style={[
                      styles.bar,
                      styles.highBar,
                      { height: Math.min(highHeight, chartHeight) },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      styles.lowBar,
                      { height: Math.min(lowHeight, chartHeight) },
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{item.date}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>收缩压</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>舒张压</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBloodSugarChart = () => {
    const maxValue = 10;
    const chartHeight = 120;
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {chartData.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            return (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barGroup}>
                  <View
                    style={[
                      styles.bar,
                      styles.sugarBar,
                      { height: Math.min(barHeight, chartHeight) },
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{item.date}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>血糖值 (mmol/L)</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 顶部标题 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>健康记录</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-record', { type: activeTab })}
          >
            <FontAwesome6 name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tab 切换 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bloodPressure' && styles.tabActive]}
            onPress={() => setActiveTab('bloodPressure')}
          >
            <FontAwesome6
              name="heart"
              size={20}
              color={activeTab === 'bloodPressure' ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[styles.tabText, activeTab === 'bloodPressure' && styles.tabTextActive]}>
              血压
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bloodSugar' && styles.tabActive]}
            onPress={() => setActiveTab('bloodSugar')}
          >
            <FontAwesome6
              name="droplet"
              size={20}
              color={activeTab === 'bloodSugar' ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[styles.tabText, activeTab === 'bloodSugar' && styles.tabTextActive]}>
              血糖
            </Text>
          </TouchableOpacity>
        </View>

        {/* 图表区域 */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>近7天趋势</Text>
          {activeTab === 'bloodPressure' ? renderBloodPressureChart() : renderBloodSugarChart()}
        </View>

        {/* 记录列表 */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>历史记录</Text>
          {records.length > 0 ? (
            records.slice(0, 5).map((record) => (
              <TouchableOpacity key={record.id} style={styles.recordItem}>
                <View style={styles.recordLeft}>
                  <View style={[styles.recordIcon, activeTab === 'bloodPressure' ? styles.iconRed : styles.iconYellow]}>
                    <FontAwesome6
                      name={activeTab === 'bloodPressure' ? 'heart' : 'droplet'}
                      size={20}
                      color={activeTab === 'bloodPressure' ? '#EF4444' : '#F59E0B'}
                    />
                  </View>
                  <View>
                    <Text style={styles.recordDate}>
                      {new Date(record.recordDate).toLocaleDateString('zh-CN', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.recordValue}>
                  {activeTab === 'bloodPressure' ? (
                    <Text style={styles.recordNumber}>
                      {record.value}/{record.secondaryValue}
                      <Text style={styles.recordUnit}> mmHg</Text>
                    </Text>
                  ) : (
                    <Text style={styles.recordNumber}>
                      {record.value}
                      <Text style={styles.recordUnit}> mmol/L</Text>
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome6 name="clipboard-list" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>暂无记录</Text>
              <Text style={styles.emptyHint}>点击右上角按钮添加记录</Text>
            </View>
          )}
        </View>

        {/* 提示卡片 */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <FontAwesome6 name="lightbulb" size={20} color="#F59E0B" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>测量小贴士</Text>
            <Text style={styles.tipText}>
              {activeTab === 'bloodPressure'
                ? '测量血压前请静坐5分钟，保持情绪平稳，建议每天同一时间测量。'
                : '空腹血糖建议在早晨起床后测量，餐后血糖在进食后2小时测量。'}
            </Text>
          </View>
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#0D9488',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    width: '100%',
    paddingHorizontal: 8,
  },
  chartBar: {
    alignItems: 'center',
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  bar: {
    width: 16,
    borderRadius: 8,
  },
  highBar: {
    backgroundColor: '#EF4444',
  },
  lowBar: {
    backgroundColor: '#3B82F6',
  },
  sugarBar: {
    backgroundColor: '#F59E0B',
    width: 32,
  },
  chartLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: '#6B7280',
  },
  recordsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  iconYellow: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  recordDate: {
    fontSize: 15,
    color: '#374151',
  },
  recordValue: {
    alignItems: 'flex-end',
  },
  recordNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0D9488',
  },
  recordUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D97706',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});

export default RecordsScreen;
