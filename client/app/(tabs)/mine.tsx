import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  color?: string;
  onPress: () => void;
  showBadge?: boolean;
}

const MenuItem = ({ icon, title, subtitle, color = '#0D9488', onPress, showBadge }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIcon, { backgroundColor: `${color}15` }]}>
      <FontAwesome6 name={icon as any} size={20} color={color} />
    </View>
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    {showBadge && <View style={styles.badge}><Text style={styles.badgeText}>NEW</Text></View>}
    <FontAwesome6 name="chevron-right" size={16} color="#D1D5DB" />
  </TouchableOpacity>
);

const MineScreen = () => {
  const router = useSafeRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login', {});
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 顶部标题 */}
        <Text style={styles.headerTitle}>我的</Text>

        {/* 用户信息卡片 */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <FontAwesome6 name="user" size={36} color="#0D9488" />
            </View>
            {user?.emergencyPhone && (
              <View style={styles.safeBadge}>
                <FontAwesome6 name="shield-halved" size={12} color="#10B981" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || '未设置姓名'}</Text>
            <Text style={styles.userPhone}>{user?.phone || ''}</Text>
            {user?.medicalHistory && (
              <View style={styles.historyBadge}>
                <FontAwesome6 name="file-medical" size={12} color="#0D9488" />
                <Text style={styles.historyText}>{user.medicalHistory}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/profile', {})}
          >
            <FontAwesome6 name="pencil" size={16} color="#0D9488" />
          </TouchableOpacity>
        </View>

        {/* 快捷功能区 */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickItem}
            onPress={() => router.push('/add-record', { type: 'bloodPressure' })}
          >
            <FontAwesome6 name="heart" size={24} color="#EF4444" />
            <Text style={styles.quickText}>测血压</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickItem}
            onPress={() => router.push('/add-record', { type: 'bloodSugar' })}
          >
            <FontAwesome6 name="droplet" size={24} color="#F59E0B" />
            <Text style={styles.quickText}>测血糖</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickItem}
            onPress={() => router.push('/cloud-consult', {})}
          >
            <FontAwesome6 name="comments" size={24} color="#0D9488" />
            <Text style={styles.quickText}>云问诊</Text>
          </TouchableOpacity>
        </View>

        {/* 菜单列表 */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>健康服务</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="pills"
              title="用药清单"
              subtitle="管理我的药物"
              onPress={() => router.push('/medications', {})}
            />
            <MenuItem
              icon="calendar-check"
              title="复诊提醒"
              subtitle="管理检查和复诊"
              onPress={() => router.push('/appointments', {})}
            />
            <MenuItem
              icon="utensils"
              title="饮食查询"
              subtitle="查询食物禁忌"
              onPress={() => router.push('/diet-search', {})}
              showBadge
            />
            <MenuItem
              icon="chart-line"
              title="健康趋势"
              subtitle="查看历史数据"
              onPress={() => router.push('/(tabs)/records', {})}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>设置</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="user"
              title="个人信息"
              subtitle="修改个人资料"
              onPress={() => router.push('/profile', {})}
            />
            <MenuItem
              icon="bell"
              title="提醒设置"
              subtitle="用药/测量提醒"
              color="#8B5CF6"
              onPress={() => Alert.alert('提示', '提醒功能正在开发中')}
            />
            <MenuItem
              icon="cog"
              title="系统设置"
              subtitle="应用偏好设置"
              color="#6B7280"
              onPress={() => Alert.alert('提示', '系统设置正在开发中')}
            />
          </View>
        </View>

        {/* 退出登录 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome6 name="right-from-bracket" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>

        {/* 版本信息 */}
        <Text style={styles.version}>云用药 v1.0.0</Text>

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
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  historyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  historyText: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '500',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  quickText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 10,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 20,
  },
});

export default MineScreen;
