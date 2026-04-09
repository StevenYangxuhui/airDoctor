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

interface Appointment {
  id: string;
  hospital: string;
  department: string;
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes: string;
}

export default function AppointmentsScreen() {
  const router = useSafeRouter();
  const { userId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    hospital: '',
    department: '',
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });

  const fetchAppointments = async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/appointments/${userId}`
      );
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [userId])
  );

  const handleAdd = () => {
    setEditingAppt(null);
    setFormData({
      hospital: '',
      department: '',
      doctor: '',
      appointmentDate: '',
      appointmentTime: '',
      notes: '',
    });
    setModalVisible(true);
  };

  const handleEdit = (appt: Appointment) => {
    setEditingAppt(appt);
    setFormData({
      hospital: appt.hospital,
      department: appt.department,
      doctor: appt.doctor,
      appointmentDate: appt.appointmentDate,
      appointmentTime: appt.appointmentTime,
      notes: appt.notes,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.appointmentDate) {
      Alert.alert('提示', '请选择预约日期');
      return;
    }

    try {
      if (editingAppt) {
        // 更新
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/appointments/${editingAppt.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          }
        );
        const data = await response.json();
        if (data.success) {
          setModalVisible(false);
          fetchAppointments();
        }
      } else {
        // 新增
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/appointments`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              ...formData,
              status: 'upcoming',
            }),
          }
        );
        const data = await response.json();
        if (data.success) {
          setModalVisible(false);
          fetchAppointments();
        }
      }
    } catch (error) {
      Alert.alert('保存失败', '请稍后重试');
    }
  };

  const handleComplete = (appt: Appointment) => {
    Alert.alert('确认完成', '确定要标记为已完成吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: async () => {
          try {
            await fetch(
              `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/appointments/${appt.id}`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' }),
              }
            );
            fetchAppointments();
          } catch (error) {
            Alert.alert('操作失败', '请稍后重试');
          }
        },
      },
    ]);
  };

  const handleDelete = (appt: Appointment) => {
    Alert.alert('确认删除', `确定要删除这个预约吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(
              `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/appointments/${appt.id}`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' }),
              }
            );
            fetchAppointments();
          } catch (error) {
            Alert.alert('删除失败', '请稍后重试');
          }
        },
      },
    ]);
  };

  const getDaysUntil = (dateStr: string) => {
    const apptDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const daysUntil = getDaysUntil(item.appointmentDate);
    const statusInfo = {
      upcoming: { label: '待就医', color: '#0D9488', bg: 'rgba(13, 148, 136, 0.12)' },
      completed: { label: '已完成', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
      cancelled: { label: '已取消', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.12)' },
    }[item.status];

    return (
      <View style={styles.apptItem}>
        <View style={styles.apptLeft}>
          <View style={[styles.apptDateBox, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.apptDay, { color: statusInfo.color }]}>
              {new Date(item.appointmentDate).getDate()}
            </Text>
            <Text style={styles.apptMonth}>
              {new Date(item.appointmentDate).toLocaleDateString('zh-CN', { month: 'short' })}
            </Text>
          </View>
          <View style={styles.apptInfo}>
            <View style={styles.apptHeader}>
              <Text style={styles.apptHospital}>{item.hospital}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>
            <Text style={styles.apptDetails}>
              {item.department} - {item.doctor}
            </Text>
            <View style={styles.apptTime}>
              <FontAwesome6 name="clock" size={12} color="#6B7280" />
              <Text style={styles.apptTimeText}>
                {formatDate(item.appointmentDate)} {item.appointmentTime}
              </Text>
              {item.status === 'upcoming' && daysUntil >= 0 && daysUntil <= 7 && (
                <View style={styles.reminderTag}>
                  <FontAwesome6 name="bell" size={10} color="#F59E0B" />
                  <Text style={styles.reminderText}>还有{daysUntil}天</Text>
                </View>
              )}
            </View>
            {item.notes && <Text style={styles.apptNotes}>{item.notes}</Text>}
          </View>
        </View>
        {item.status === 'upcoming' && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleComplete(item)}
          >
            <FontAwesome6 name="check" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>复诊提醒</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <FontAwesome6 name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* 提示信息 */}
      <View style={styles.tipCard}>
        <FontAwesome6 name="lightbulb" size={18} color="#0D9488" />
        <Text style={styles.tipText}>
          系统会在预约日期前提醒您就医，临近日期时会结合定位智能提醒
        </Text>
      </View>

      {/* 预约列表 */}
      {appointments.length > 0 ? (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <FontAwesome6 name="calendar-times" size={48} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyTitle}>暂无预约记录</Text>
          <Text style={styles.emptyText}>
            添加您的检查和复诊安排，系统会智能提醒
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleAdd}>
            <FontAwesome6 name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>添加预约</Text>
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
                {editingAppt ? '编辑预约' : '添加预约'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome6 name="times" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>医院 *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="请输入医院名称"
                placeholderTextColor="#D1D5DB"
                value={formData.hospital}
                onChangeText={(text) => setFormData({ ...formData, hospital: text })}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>科室</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="如：心内科"
                  placeholderTextColor="#D1D5DB"
                  value={formData.department}
                  onChangeText={(text) => setFormData({ ...formData, department: text })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>医生</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="医生姓名"
                  placeholderTextColor="#D1D5DB"
                  value={formData.doctor}
                  onChangeText={(text) => setFormData({ ...formData, doctor: text })}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>预约日期 *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#D1D5DB"
                  value={formData.appointmentDate}
                  onChangeText={(text) => setFormData({ ...formData, appointmentDate: text })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>时间</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="如：09:00"
                  placeholderTextColor="#D1D5DB"
                  value={formData.appointmentTime}
                  onChangeText={(text) => setFormData({ ...formData, appointmentTime: text })}
                />
              </View>
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
  apptItem: {
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
  apptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  apptDateBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  apptDay: {
    fontSize: 20,
    fontWeight: '800',
  },
  apptMonth: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  apptInfo: {
    flex: 1,
  },
  apptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  apptHospital: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  apptDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  apptTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  apptTimeText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  reminderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  reminderText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '500',
  },
  apptNotes: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
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
  formRow: {
    flexDirection: 'row',
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
