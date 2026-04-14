import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
  ScrollView,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

const ProfileScreen = () => {
  const router = useSafeRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyPhone || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入姓名');
      return;
    }

    if (emergencyContact && !emergencyPhone) {
      Alert.alert('提示', '请输入紧急联系人电话');
      return;
    }

    if (emergencyPhone && !/^1[3-9]\d{9}$/.test(emergencyPhone)) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/users/${user?.userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            emergencyContact: emergencyContact.trim(),
            emergencyPhone: emergencyPhone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert('成功', '个人信息已更新', [
          {
            text: '确定',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('保存失败', data.message || '请稍后重试');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('保存失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome6 name="arrow-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>个人资料</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>姓名</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入您的姓名"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>手机号</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                placeholder="未设置"
                placeholderTextColor="#9CA3AF"
                value={user?.phone || ''}
                editable={false}
              />
              <Text style={styles.hint}>手机号不可修改</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>紧急联系人</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入紧急联系人姓名"
                placeholderTextColor="#9CA3AF"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>紧急联系人电话</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入紧急联系人电话"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={11}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <FontAwesome6 name="spinner" size={20} color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>保存</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  inputDisabled: {
    backgroundColor: '#E5E7EB',
    color: '#9CA3AF',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#0D9488',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;
