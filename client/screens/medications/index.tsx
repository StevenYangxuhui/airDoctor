import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface Medication {
  id: number;
  userId: number;
  name: string;
  dosage: string;
  frequency: string;
  startTime: string;
  notes?: string;
  createdAt: string;
}

const MedicationsScreen = () => {
  const router = useSafeRouter();
  const { userId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startTime: '',
    notes: '',
  });

  const fetchMedications = async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/medications/${userId}`
      );
      const data = await response.json();
      if (data.success) {
        setMedications(data.medications || []);
      }
    } catch (error) {
      console.error('Failed to fetch medications:', error);
      Alert.alert('错误', '获取用药清单失败');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMedications();
    }, [userId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMedications();
    setRefreshing(false);
  };

  const handleAdd = () => {
    setEditingMedication(null);
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      startTime: '',
      notes: '',
    });
    setModalVisible(true);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      startTime: medication.startTime,
      notes: medication.notes || '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条用药记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/medications/${id}`,
                {
                  method: 'DELETE',
                }
              );
              const data = await response.json();
              if (data.success) {
                await fetchMedications();
              } else {
                Alert.alert('错误', data.message || '删除失败');
              }
            } catch (error) {
              console.error('Failed to delete medication:', error);
              Alert.alert('错误', '删除失败');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('提示', '请输入药品名称');
      return;
    }
    if (!formData.dosage.trim()) {
      Alert.alert('提示', '请输入剂量');
      return;
    }
    if (!formData.frequency.trim()) {
      Alert.alert('提示', '请输入服药频率');
      return;
    }

    setLoading(true);

    try {
      const url = editingMedication
        ? `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/medications/${editingMedication.id}`
        : `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/medications`;

      const response = await fetch(url, {
        method: editingMedication ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name: formData.name.trim(),
          dosage: formData.dosage.trim(),
          frequency: formData.frequency.trim(),
          startTime: formData.startTime.trim() || '立即开始',
          notes: formData.notes.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setModalVisible(false);
        await fetchMedications();
      } else {
        Alert.alert('保存失败', data.message || '请稍后重试');
      }
    } catch (error) {
      console.error('Save medication error:', error);
      Alert.alert('保存失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>用药清单</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAdd}
        >
          <FontAwesome6 name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {medications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="prescription-bottle-medical" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>暂无用药记录</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAdd}
            >
              <Text style={styles.emptyButtonText}>添加第一个药物</Text>
            </TouchableOpacity>
          </View>
        ) : (
          medications.map((medication) => (
            <View key={medication.id} style={styles.medicationCard}>
              <TouchableOpacity
                style={styles.medicationContent}
                onPress={() => handleEdit(medication)}
              >
                <View style={styles.medicationIconContainer}>
                  <FontAwesome6 name="pills" size={28} color="#0D9488" />
                </View>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDetail}>
                    剂量: {medication.dosage}
                  </Text>
                  <Text style={styles.medicationDetail}>
                    频率: {medication.frequency}
                  </Text>
                  {medication.notes && (
                    <Text style={styles.medicationNote}>
                      备注: {medication.notes}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(medication.id)}
              >
                <FontAwesome6 name="trash-can" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 添加/编辑 Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMedication ? '编辑药物' : '添加药物'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome6 name="xmark" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>药品名称 *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="请输入药品名称"
                  placeholderTextColor="#9CA3AF"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>剂量 *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="如: 每次1片"
                  placeholderTextColor="#9CA3AF"
                  value={formData.dosage}
                  onChangeText={(text) => setFormData({ ...formData, dosage: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>服药频率 *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="如: 每日3次"
                  placeholderTextColor="#9CA3AF"
                  value={formData.frequency}
                  onChangeText={(text) => setFormData({ ...formData, frequency: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>开始时间</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="如: 早餐后"
                  placeholderTextColor="#9CA3AF"
                  value={formData.startTime}
                  onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>备注</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputMultiline]}
                  placeholder="如: 饭前服用"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <FontAwesome6 name="spinner" size={20} color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>保存</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  medicationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  medicationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  medicationDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  medicationNote: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  deleteButton: {
    width: 50,
    height: '100%',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  formInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#0D9488',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MedicationsScreen;
