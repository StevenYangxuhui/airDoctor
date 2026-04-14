import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

type RecordType = 'bloodPressure' | 'bloodSugar';

interface HealthRecord {
  id: number;
  userId: number;
  type: RecordType;
  value: number;
  secondaryValue?: number;
  unit: string;
  recordDate: string;
  createdAt: string;
}

const RecordsScreen = () => {
  const router = useSafeRouter();
  const { userId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filterType, setFilterType] = useState<RecordType | 'all'>('all');

  const fetchRecords = async () => {
    if (!userId) return;
    try {
      const url = filterType === 'all'
        ? `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/health-records/${userId}`
        : `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/health-records/${userId}?type=${filterType}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
      Alert.alert('错误', '获取健康记录失败');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [userId, filterType])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/health-records/${id}`,
                {
                  method: 'DELETE',
                }
              );
              const data = await response.json();
              if (data.success) {
                await fetchRecords();
              } else {
                Alert.alert('错误', data.message || '删除失败');
              }
            } catch (error) {
              console.error('Failed to delete record:', error);
              Alert.alert('错误', '删除失败');
            }
          },
        },
      ]
    );
  };

  const formatRecordDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRecordValue = (record: HealthRecord) => {
    if (record.type === 'bloodPressure') {
      return `${record.value}/${record.secondaryValue} ${record.unit}`;
    }
    return `${record.value} ${record.unit}`;
  };

  const getRecordIcon = (type: RecordType) => {
    if (type === 'bloodPressure') {
      return { name: 'heart', color: '#EF4444' };
    }
    return { name: 'droplet', color: '#F59E0B' };
  };

  const filteredRecords = filterType === 'all' ? records : records.filter(r => r.type === filterType);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>健康记录</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-record', {})}
        >
          <FontAwesome6 name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 筛选器 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterType('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === 'all' && styles.filterButtonTextActive,
            ]}
          >
            全部
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'bloodPressure' && styles.filterButtonActive]}
          onPress={() => setFilterType('bloodPressure')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === 'bloodPressure' && styles.filterButtonTextActive,
            ]}
          >
            血压
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'bloodSugar' && styles.filterButtonActive]}
          onPress={() => setFilterType('bloodSugar')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === 'bloodSugar' && styles.filterButtonTextActive,
            ]}
          >
            血糖
          </Text>
        </TouchableOpacity>
      </View>

      {/* 记录列表 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="clipboard-list" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>暂无记录</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/add-record', {})}
            >
              <Text style={styles.emptyButtonText}>添加第一条记录</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredRecords.map((record) => {
            const icon = getRecordIcon(record.type);
            return (
              <View key={record.id} style={styles.recordCard}>
                <View style={styles.recordIconContainer}>
                  <FontAwesome6 name={icon.name as any} size={28} color={icon.color} />
                </View>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordValue}>{getRecordValue(record)}</Text>
                  <Text style={styles.recordDate}>{formatRecordDate(record.recordDate)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(record.id)}
                >
                  <FontAwesome6 name="trash-can" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#0D9488',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  recordIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default RecordsScreen;
