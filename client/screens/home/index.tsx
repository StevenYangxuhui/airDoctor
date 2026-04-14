import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface HealthData {
  latestBloodPressure: { value: number; secondaryValue: number } | null;
  latestBloodSugar: { value: number } | null;
}

const HomeScreen = () => {
  const router = useSafeRouter();
  const { user, userId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState<HealthData>({
    latestBloodPressure: null,
    latestBloodSugar: null,
  });

  const fetchHealthData = async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/health-records/${userId}/latest`
      );
      const data = await response.json();
      if (data.success) {
        setHealthData({
          latestBloodPressure: data.latestBloodPressure || null,
          latestBloodSugar: data.latestBloodSugar || null,
        });
      }
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHealthData();
    }, [userId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHealthData();
    setRefreshing(false);
  };

  const handleEmergencyCall = () => {
    if (!user?.emergencyPhone) {
      Alert.alert(
        '未设置紧急联系人',
        '请先在"我的"页面中设置紧急联系人和电话',
        [
          { text: '取消', style: 'cancel' },
          { text: '去设置', onPress: () => router.push('/profile', {}) },
        ]
      );
      return;
    }

    Alert.alert(
      '紧急呼叫',
      `确定要呼叫紧急联系人 ${user.emergencyContact} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '呼叫',
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${user.emergencyPhone}`),
        },
      ]
    );
  };

  const handleQuickMeasure = (type: 'bloodPressure' | 'bloodSugar') => {
    router.push('/add-record', { type });
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 顶部区域 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user?.name ? `${user.name}，你好！` : '你好！'}
            </Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile', {})}
          >
            <FontAwesome6 name="circle-user" size={28} color="#0D9488" />
          </TouchableOpacity>
        </View>

        {/* 快捷功能入口 - 红绿灯和用药清单 */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/diet-search', {})}
          >
            <View style={[styles.quickIcon, styles.iconRed]}>
              <FontAwesome6 name="traffic-light" size={24} color="#EF4444" />
            </View>
            <Text style={styles.quickTitle}>饮食红绿灯</Text>
            <Text style={styles.quickSubtitle}>查看饮食禁忌</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/medications', {})}
          >
            <View style={[styles.quickIcon, styles.iconTeal]}>
              <FontAwesome6 name="pills" size={24} color="#0D9488" />
            </View>
            <Text style={styles.quickTitle}>用药清单</Text>
            <Text style={styles.quickSubtitle}>管理我的药物</Text>
          </TouchableOpacity>
        </View>

        {/* 云问诊和紧急呼叫 */}
        <View style={styles.mainActions}>
          <TouchableOpacity
            style={styles.mainCard}
            onPress={() => router.push('/cloud-consult', {})}
          >
            <View style={styles.mainCardContent}>
              <View style={styles.mainIconContainer}>
                <FontAwesome6 name="comments" size={28} color="#0D9488" />
              </View>
              <View style={styles.mainTextContainer}>
                <Text style={styles.mainCardTitle}>云问诊</Text>
                <Text style={styles.mainCardDesc}>AI智能问诊，结合病历分析</Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainCard, styles.emergencyCard]}
            onPress={handleEmergencyCall}
          >
            <View style={styles.mainCardContent}>
              <View style={[styles.mainIconContainer, styles.emergencyIcon]}>
                <FontAwesome6 name="phone-volume" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.mainTextContainer}>
                <Text style={[styles.mainCardTitle, styles.emergencyTitle]}>
                  紧急呼叫
                </Text>
                <Text style={styles.mainCardDesc}>
                  {user?.emergencyContact
                    ? `呼叫 ${user.emergencyContact}`
                    : '联系紧急联系人'}
                </Text>
              </View>
            </View>
            <FontAwesome6 name="chevron-right" size={20} color="#FFFFFF80" />
          </TouchableOpacity>
        </View>

        {/* 快速测量入口 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>快速测量</Text>
        </View>

        <View style={styles.measureCards}>
          <TouchableOpacity
            style={styles.measureCard}
            onPress={() => handleQuickMeasure('bloodPressure')}
          >
            <View style={[styles.measureIcon, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <FontAwesome6 name="heart" size={32} color="#EF4444" />
            </View>
            <Text style={styles.measureTitle}>血压</Text>
            {healthData.latestBloodPressure ? (
              <View style={styles.measureValue}>
                <Text style={styles.measureNumber}>
                  {healthData.latestBloodPressure.value}
                </Text>
                <Text style={styles.measureUnit}>/{healthData.latestBloodPressure.secondaryValue} mmHg</Text>
              </View>
            ) : (
              <Text style={styles.measureHint}>点击记录</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.measureCard}
            onPress={() => handleQuickMeasure('bloodSugar')}
          >
            <View style={[styles.measureIcon, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <FontAwesome6 name="droplet" size={32} color="#F59E0B" />
            </View>
            <Text style={styles.measureTitle}>血糖</Text>
            {healthData.latestBloodSugar ? (
              <View style={styles.measureValue}>
                <Text style={styles.measureNumber}>
                  {healthData.latestBloodSugar.value}
                </Text>
                <Text style={styles.measureUnit}>mmol/L</Text>
              </View>
            ) : (
              <Text style={styles.measureHint}>点击记录</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 复诊提醒入口 */}
        <TouchableOpacity
          style={styles.appointmentCard}
          onPress={() => router.push('/appointments', {})}
        >
          <View style={styles.appointmentLeft}>
            <View style={styles.appointmentIcon}>
              <FontAwesome6 name="calendar-check" size={24} color="#0D9488" />
            </View>
            <View>
              <Text style={styles.appointmentTitle}>复诊提醒</Text>
              <Text style={styles.appointmentHint}>管理您的检查和复诊安排</Text>
            </View>
          </View>
          <FontAwesome6 name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* 底部安全距离 */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </Screen>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  iconTeal: {
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  quickSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  mainActions: {
    marginBottom: 24,
  },
  mainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  emergencyCard: {
    backgroundColor: '#EF4444',
  },
  mainCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mainIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  mainTextContainer: {
    flex: 1,
  },
  mainCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  emergencyTitle: {
    color: '#FFFFFF',
  },
  mainCardDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  measureCards: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  measureCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  measureIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  measureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  measureValue: {
    alignItems: 'center',
  },
  measureNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0D9488',
  },
  measureUnit: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  measureHint: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  appointmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  appointmentHint: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default HomeScreen;
