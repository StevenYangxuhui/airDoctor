import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const router = useSafeRouter();
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    idCard: user?.idCard || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || '',
    emergencyContact: user?.emergencyContact || '',
    emergencyPhone: user?.emergencyPhone || '',
    medicalHistory: user?.medicalHistory || '',
    doctorNotes: user?.doctorNotes || '',
  });

  const handleSave = async () => {
    try {
      await updateUser({
        ...editedUser,
        age: editedUser.age ? parseInt(editedUser.age) : 0,
      });
      setIsEditing(false);
      Alert.alert('保存成功', '个人信息已更新');
    } catch (error) {
      Alert.alert('保存失败', '请稍后重试');
    }
  };

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

  const InfoItem = ({ icon, label, value, editable = false, field, multiline = false }: { icon: string; label: string; value?: string; editable?: boolean; field?: keyof typeof editedUser; multiline?: boolean }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoLeft}>
        <View style={styles.infoIcon}>
          <FontAwesome6 name={icon} size={18} color="#0D9488" />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      {isEditing && editable && field ? (
        multiline ? (
          <TextInput
            style={[styles.infoValue, styles.infoInput, { height: 80, textAlignVertical: 'top' }]}
            value={editedUser[field]}
            onChangeText={(text) => setEditedUser({ ...editedUser, [field]: text })}
            multiline
            placeholder={`请输入${label}`}
            placeholderTextColor="#9CA3AF"
          />
        ) : (
          <TextInput
            style={[styles.infoValue, styles.infoInput]}
            value={editedUser[field]}
            onChangeText={(text) => setEditedUser({ ...editedUser, [field]: text })}
            placeholder={`请输入${label}`}
            placeholderTextColor="#9CA3AF"
          />
        )
      ) : (
        <Text style={styles.infoValue}>{value || '未设置'}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 顶部导航 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome6 name="arrow-left" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>个人信息</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? '保存' : '编辑'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 头像和基本信息 */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <FontAwesome6 name="user" size={40} color="#0D9488" />
              </View>
            </View>
            <Text style={styles.userName}>{user?.name || '未设置姓名'}</Text>
            <Text style={styles.userPhone}>{user?.phone || ''}</Text>
          </View>

          {/* 基本信息区块 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>基本信息</Text>
            <View style={styles.infoCard}>
              <InfoItem icon="user" label="姓名" value={user?.name} editable field="name" />
              <InfoItem icon="id-card" label="身份证号" value={user?.idCard} editable field="idCard" />
              <InfoItem icon="birthday-cake" label="年龄" value={user?.age ? `${user.age}岁` : ''} editable field="age" />
              <InfoItem icon="mars-or-venus" label="性别" value={user?.gender} editable field="gender" />
            </View>
          </View>

          {/* 紧急联系人区块 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>紧急联系人</Text>
            <View style={styles.infoCard}>
              <InfoItem icon="user-plus" label="联系人姓名" value={user?.emergencyContact} editable field="emergencyContact" />
              <InfoItem icon="phone" label="联系电话" value={user?.emergencyPhone} editable field="emergencyPhone" />
            </View>
          </View>

          {/* 病历信息区块 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>病历信息</Text>
            <View style={styles.infoCard}>
              <InfoItem icon="file-medical" label="既往病史" value={user?.medicalHistory || '暂无记录'} editable field="medicalHistory" multiline />
              <InfoItem icon="notes-medical" label="医嘱备注" value={user?.doctorNotes || '暂无记录'} editable field="doctorNotes" multiline />
            </View>
          </View>

          {/* 退出登录 */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome6 name="sign-out-alt" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0D9488',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    paddingLeft: 4,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#374151',
  },
  infoValue: {
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
    textAlign: 'right',
  },
  infoInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
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
});
