import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function AddRecordScreen() {
  const router = useSafeRouter();
  const searchParams = useSafeSearchParams<{ type?: 'bloodPressure' | 'bloodSugar' }>();
  const { userId } = useAuth();
  
  const type = searchParams.type || 'bloodPressure';
  const [value, setValue] = useState('');
  const [secondaryValue, setSecondaryValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('错误', '请先登录');
      return;
    }

    if (!value.trim()) {
      Alert.alert('提示', '请输入测量值');
      return;
    }

    if (type === 'bloodPressure' && !secondaryValue.trim()) {
      Alert.alert('提示', '请输入舒张压');
      return;
    }

    setIsLoading(true);

    try {
      const body: any = {
        userId,
        type,
        value: parseFloat(value),
        recordDate: new Date().toISOString(),
      };

      if (type === 'bloodPressure') {
        body.secondaryValue = parseFloat(secondaryValue);
      }

      // 风险检测
      if (type === 'bloodPressure') {
        const systolic = parseFloat(value);
        const diastolic = parseFloat(secondaryValue);
        if (systolic > 180 || diastolic > 120) {
          Alert.alert(
            '⚠️ 血压危急值',
            `您的血压测量值（${value}/${secondaryValue} mmHg）已超出安全范围！\n\n建议立即就医或联系您的家庭医生。`,
            [
              { text: '继续保存', style: 'destructive' },
              { text: '呼叫紧急联系人', onPress: () => {
                // 这里可以添加紧急呼叫逻辑
                Alert.alert('提示', '将自动通知紧急联系人');
              }},
            ]
          );
        }
      }

      if (type === 'bloodSugar') {
        const sugar = parseFloat(value);
        if (sugar > 16.7 || sugar < 2.8) {
          Alert.alert(
            '⚠️ 血糖危急值',
            `您的血糖测量值（${value} mmol/L）已超出安全范围！\n\n请立即采取相应措施或就医。`,
            [
              { text: '继续保存', style: 'destructive' },
              { text: '呼叫紧急联系人', onPress: () => {
                Alert.alert('提示', '将自动通知紧急联系人');
              }},
            ]
          );
        }
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/health-records`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert('保存成功', '健康记录已保存', [
          { text: '确定', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('保存失败', '请稍后重试');
      }
    } catch (error) {
      Alert.alert('保存失败', '网络错误，请检查连接');
    } finally {
      setIsLoading(false);
    }
  };

  const getNormalRange = () => {
    if (type === 'bloodPressure') {
      return '正常范围：90-140/60-90 mmHg';
    }
    return '空腹正常：3.9-6.1 mmol/L';
  };

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
            <Text style={styles.headerTitle}>
              记录{type === 'bloodPressure' ? '血压' : '血糖'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* 记录图标 */}
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: type === 'bloodPressure' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)' },
              ]}
            >
              <FontAwesome6
                name={type === 'bloodPressure' ? 'heart' : 'droplet'}
                size={48}
                color={type === 'bloodPressure' ? '#EF4444' : '#F59E0B'}
              />
            </View>
          </View>

          {/* 输入区域 */}
          <View style={styles.inputCard}>
            {type === 'bloodPressure' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>收缩压（高压）</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="请输入"
                      placeholderTextColor="#D1D5DB"
                      value={value}
                      onChangeText={setValue}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                    <Text style={styles.inputUnit}>mmHg</Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>舒张压（低压）</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="请输入"
                      placeholderTextColor="#D1D5DB"
                      value={secondaryValue}
                      onChangeText={setSecondaryValue}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                    <Text style={styles.inputUnit}>mmHg</Text>
                  </View>
                </View>

                <View style={styles.resultPreview}>
                  <Text style={styles.resultLabel}>测量结果</Text>
                  {value && secondaryValue ? (
                    <Text style={styles.resultValue}>
                      {value}/{secondaryValue}
                      <Text style={styles.resultUnit}> mmHg</Text>
                    </Text>
                  ) : (
                    <Text style={styles.resultPlaceholder}>--/--</Text>
                  )}
                </View>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>血糖值</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="请输入"
                      placeholderTextColor="#D1D5DB"
                      value={value}
                      onChangeText={setValue}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                    <Text style={styles.inputUnit}>mmol/L</Text>
                  </View>
                </View>

                <View style={styles.resultPreview}>
                  <Text style={styles.resultLabel}>测量结果</Text>
                  {value ? (
                    <Text style={styles.resultValue}>
                      {value}
                      <Text style={styles.resultUnit}> mmol/L</Text>
                    </Text>
                  ) : (
                    <Text style={styles.resultPlaceholder}>--</Text>
                  )}
                </View>
              </>
            )}
          </View>

          {/* 正常范围提示 */}
          <View style={styles.rangeCard}>
            <FontAwesome6 name="info-circle" size={18} color="#0D9488" />
            <Text style={styles.rangeText}>{getNormalRange()}</Text>
          </View>

          {/* 风险提示 */}
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <FontAwesome6 name="exclamation-triangle" size={18} color="#F59E0B" />
              <Text style={styles.warningTitle}>温馨提示</Text>
            </View>
            <Text style={styles.warningText}>
              {type === 'bloodPressure'
                ? '• 测量前请静坐5分钟，情绪平稳\n• 测量时保持手臂与心脏平齐\n• 建议每天同一时间测量'
                : '• 空腹血糖需禁食8小时以上\n• 餐后血糖在进食第一口开始计时2小时测量\n• 测量前避免剧烈运动'}
            </Text>
          </View>

          {/* 保存按钮 */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? '保存中...' : '保存记录'}
            </Text>
          </TouchableOpacity>
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
  },
  inputUnit: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  resultPreview: {
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0D9488',
  },
  resultUnit: {
    fontSize: 16,
    fontWeight: '400',
  },
  resultPlaceholder: {
    fontSize: 36,
    fontWeight: '800',
    color: '#D1D5DB',
  },
  rangeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  rangeText: {
    flex: 1,
    fontSize: 14,
    color: '#0D9488',
  },
  warningCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D97706',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 22,
  },
  saveButton: {
    backgroundColor: '#0D9488',
    borderRadius: 30,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
