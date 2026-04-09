import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  reminderTimes: string[];
  notes: string;
}

export default function MedicationsScreen() {
  const router = useSafeRouter();
  const { userId } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    reminderTimes: '',
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
        setMedications(data.medications);
      }
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMedications();
    }, [userId])
  );

  const handleAdd = () => {
    setEditingMed(null);
    setFormData({ name: '', dosage: '', frequency: '', reminderTimes: '', notes: '' });
    setModalVisible(true);
  };

  const handleEdit = (med: Medication) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      reminderTimes: med.reminderTimes.join(', '),
      notes: med.notes,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('提示', '请输入药品名称');
      return;
    }

    try {
      const timesArray = formData.reminderTimes
        ? formData.reminderTimes.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      if (editingMed) {
        // 更新
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/medications/${editingMed.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              reminderTimes: timesArray,
            }),
          }
        );
        const data = await response.json();
        if (data.success) {
          setModalVisible(false);
          fetchMedications();
        }
      } else {
        // 新增
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/medications`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              name: formData.name,
              dosage: formData.dosage,
              frequency: formData.frequency,
              reminderTimes: timesArray,
              notes: formData.notes,
            }),
          }
        );
        const data = await response.json();
        if (data.success) {
          setModalVisible(false);
          fetchMedications();
        }
      }
    } catch (error) {
      Alert.alert('保存失败', '请稍后重试');
    }
  };

  const handleDelete = (med: Medication) => {
    Alert.alert('确认删除', `确定要删除「${med.name}」吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(
              `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/medications/${med.id}`,
              { method: 'DELETE' }
            );
            fetchMedications();
          } catch (error) {
            Alert.alert('删除失败', '请稍后重试');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Medication }) => (
    <TouchableOpacity style={styles.medItem} onPress={() => handleEdit(item)}>
      <View style={styles.medLeft}>
        <View style={styles.medIcon}>
          <FontAwesome6 name="pills" size={24} color="#0D9488" />
        </View>
        <View style={styles.medInfo}>
          <Text style={styles.medName}>{item.name}</Text>
          {item.dosage && <Text style={styles.medDosage}>{item.dosage}</Text>}
          {item.frequency && <Text style={styles.medFrequency}>{item.frequency}</Text>}
          {item.reminderTimes.length > 0 && (
            <View style={styles.timeTags}>
              {item.reminderTimes.map((time, index) => (
                <View key={index} style={styles.timeTag}>
                  <FontAwesome6 name="clock" size={10} color="#0D9488" />
                  <Text style={styles.timeTagText}>{time}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item)}
      >
        <FontAwesome6 name="trash-alt" size={18} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>用药清单</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <FontAwesome6 name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 提示信息 */}
      <View style={styles.tipCard}>
        <FontAwesome6 name="info-circle" size={18} color="#0D9488" />
        <Text style={styles.tipText}>
          点击卡片可编辑用药信息，设置提醒时间后将在指定时间收到服药提醒
        </Text>
      </View>

      {/* 用药列表 */}
      {medications.length > 0 ? (
        <FlatList
          data={medications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <FontAwesome6 name="pills" size={48} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyTitle}>暂无用药记录</Text>
          <Text style={styles.emptyText}>
            点击右上角按钮添加您的用药信息
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAdd}>
            <FontAwesome6 name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>添加用药</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 添加/编辑弹窗 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMed ? '编辑用药' : '添加用药'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome6 name="times" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>药品名称 *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="请输入药品名称"
                placeholderTextColor="#D1D5DB"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>剂量</Text>
              <TextInput
                style={styles.formInput}
                placeholder="如：1片、5mg"
                placeholderTextColor="#D1D5DB"
                value={formData.dosage}
                onChangeText={(text) => setFormData({ ...formData, dosage: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>服用频率</Text>
              <TextInput
                style={styles.formInput}
                placeholder="如：每日3次、早晚各1次"
                placeholderTextColor="#D1D5DB"
                value={formData.frequency}
                onChangeText={(text) => setFormData({ ...formData, frequency: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>提醒时间</Text>
              <TextInput
                style={styles.formInput}
                placeholder="多个时间用逗号分隔，如：08:00, 12:00, 20:00"
                placeholderTextColor="#D1D5DB"
                value={formData.reminderTimes}
                onChangeText={(text) => setFormData({ ...formData, reminderTimes: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>备注</Text>
              <TextInput
                style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="其他说明"
                placeholderTextColor="#D1D5DB"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#0D9488',
    lineHeight: 18,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  medLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  medDosage: {
    fontSize: 14,
    color: '#0D9488',
    fontWeight: '500',
    marginBottom: 2,
  },
  medFrequency: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  timeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  timeTagText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#0D9488',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
