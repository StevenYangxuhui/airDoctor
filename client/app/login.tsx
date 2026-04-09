import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phone.trim()) {
      Alert.alert('提示', '请输入手机号');
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('提示', '请输入姓名');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(phone);
        if (result.success) {
          router.replace('/(tabs)');
        } else {
          Alert.alert('登录失败', result.error || '请检查手机号是否正确');
        }
      } else {
        const result = await register(
          phone,
          name,
          idCard || undefined,
          age ? parseInt(age) : undefined,
          gender || undefined
        );
        if (result.success) {
          router.replace('/(tabs)');
        } else {
          Alert.alert('注册失败', result.error || '请稍后重试');
        }
      }
    } catch (error) {
      Alert.alert('操作失败', '网络错误，请检查连接后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo 区域 */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <FontAwesome6 name="heart-pulse" size={48} color="#0D9488" />
            </View>
            <Text style={styles.appName}>云用药</Text>
            <Text style={styles.appSlogan}>您的健康用药助手</Text>
          </View>

          {/* 表单区域 */}
          <View style={styles.formContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.tabActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>登录</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>注册</Text>
              </TouchableOpacity>
            </View>

            {/* 手机号 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>手机号</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome6 name="phone" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="请输入手机号"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            </View>

            {/* 姓名（注册时显示） */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>姓名</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome6 name="user" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="请输入姓名"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            {/* 身份证号（注册时可选） */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>身份证号（可选）</Text>
                <View style={styles.inputWrapper}>
                  <FontAwesome6 name="id-card" size={18} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="用于绑定病历信息"
                    placeholderTextColor="#9CA3AF"
                    value={idCard}
                    onChangeText={setIdCard}
                    keyboardType="default"
                    maxLength={18}
                  />
                </View>
              </View>
            )}

            {/* 年龄和性别（注册时可选） */}
            {!isLogin && (
              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>年龄（可选）</Text>
                  <View style={styles.inputWrapper}>
                    <FontAwesome6 name="birthday-cake" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="年龄"
                      placeholderTextColor="#9CA3AF"
                      value={age}
                      onChangeText={setAge}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  </View>
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>性别（可选）</Text>
                  <View style={styles.inputWrapper}>
                    <FontAwesome6 name="mars-or-venus" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="男/女"
                      placeholderTextColor="#9CA3AF"
                      value={gender}
                      onChangeText={setGender}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* 提交按钮 */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? '处理中...' : isLogin ? '登录' : '注册'}
              </Text>
            </TouchableOpacity>

            {/* 提示文字 */}
            <Text style={styles.hintText}>
              {isLogin
                ? '首次使用将自动注册，绑定病历后享受更多服务'
                : '注册后可在个人中心完善信息并绑定病历'}
            </Text>
          </View>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0D9488',
    marginBottom: 8,
  },
  appSlogan: {
    fontSize: 16,
    color: '#6B7280',
  },
  formContainer: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5EBF1',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#0D9488',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#1F2937',
  },
  rowContainer: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: '#0D9488',
    borderRadius: 30,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  hintText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
});
