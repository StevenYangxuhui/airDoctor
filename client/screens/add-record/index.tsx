import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

type RecordType = 'bloodPressure' | 'bloodSugar';

const AddRecordScreen = () => {
  const router = useSafeRouter();
  const { userId } = useAuth();
  const params = useSafeSearchParams<{ type?: string }>();

  const [recordType, setRecordType] = useState<RecordType>(
    (params.type as RecordType) || 'bloodPressure'
  );
  const [loading, setLoading] = useState(false);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');

  const handleSave = async () => {
    if (recordType === 'bloodPressure') {
      if (!systolic || !diastolic) {
        Alert.alert('提示', '请输入收缩压和舒张压');
        return;
      }

      const sys = parseFloat(systolic);
      const dia = parseFloat(diastolic);

      if (sys <= 0 || dia <= 0) {
        Alert.alert('提示', '请输入有效的数值');
        return;
      }

      if (sys < 60 || sys > 250) {
        Alert.alert('提示', '收缩压值超出正常范围');
        return;
      }

      if (dia < 40 || dia > 150) {
        Alert.alert('提示', '舒张压值超出正常范围');
        return;
      }
    } else {
      if (!bloodSugar) {
        Alert.alert('提示', '请输入血糖值');
        return;
      }

      const value = parseFloat(bloodSugar);

      if (value <= 0) {
        Alert.alert('提示', '请输入有效的数值');
        return;
      }

      if (value < 1 || value > 30) {
        Alert.alert('提示', '血糖值超出正常范围');
        return;
      }
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const recordData = {
        userId,
        type: recordType,
        value: recordType === 'bloodPressure' ? parseFloat(systolic) : parseFloat(bloodSugar),
        secondaryValue: recordType === 'bloodPressure' ? parseFloat(diastolic) : undefined,
        unit: recordType === 'bloodPressure' ? 'mmHg' : 'mmol/L',
        recordDate: new Date().toISOString(),
      };

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/health-records`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recordData),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert('成功', '记录已保存', [
          {
            text: '确定',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('保存失败', data.message || '请稍后重试');
      }
    } catch (error) {
      console.error('Save record error:', error);
      Alert.alert('保存失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: RecordType) => {
    setRecordType(type);
    setSystolic('');
    setDiastolic('');
    setBloodSugar('');
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.title}>添加记录</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 记录类型选择 */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                recordType === 'bloodPressure' && styles.typeButtonActive,
              ]}
              onPress={() => handleTypeChange('bloodPressure')}
            >
              <FontAwesome6
                name="heart"
                size={24}
                color={recordType === 'bloodPressure' ? '#EF4444' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  recordType === 'bloodPressure' && styles.typeButtonTextActive,
                ]}
              >
                血压
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                recordType === 'bloodSugar' && styles.typeButtonActive,
              ]}
              onPress={() => handleTypeChange('bloodSugar')}
            >
              <FontAwesome6
                name="droplet"
                size={24}
                color={recordType === 'bloodSugar' ? '#F59E0B' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  recordType === 'bloodSugar' && styles.typeButtonTextActive,
                ]}
              >
                血糖
              </Text>
            </TouchableOpacity>
          </View>

          {/* 表单 */}
          <View style={styles.form}>
            {recordType === 'bloodPressure' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>收缩压 (高压)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="如: 120"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={systolic}
                    onChangeText={setSystolic}
                  />
                  <Text style={styles.unit}>mmHg</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>舒张压 (低压)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="如: 80"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={diastolic}
                    onChangeText={setDiastolic}
                  />
                  <Text style={styles.unit}>mmHg</Text>
                </View>
              </>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>血糖值</Text>
                <TextInput
                  style={styles.input}
                  placeholder="如: 6.5"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={bloodSugar}
                  onChangeText={setBloodSugar}
                />
                <Text style={styles.unit}>mmol/L</Text>
              </View>
            )}

            {/* 参考范围提示 */}
            <View style={styles.tipsCard}>
              <FontAwesome6 name="circle-info" size={20} color="#0D9488" />
              <View style={styles.tipsContent}>
                <Text style={styles.tipsTitle}>参考范围</Text>
                <Text style={styles.tipsText}>
                  {recordType === 'bloodPressure'
                    ? '正常血压: 收缩压 90-140 mmHg, 舒张压 60-90 mmHg'
                    : '空腹血糖: 3.9-6.1 mmol/L, 餐后2小时: <7.8 mmol/L'}
                </Text>
              </View>
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
              <Text style={styles.saveButtonText}>保存记录</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#0D9488',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
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
  inputGroup: {
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  unit: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
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

export default AddRecordScreen;
