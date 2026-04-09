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
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
  id: number;
  userId: number;
  title: string;
  date: string;
  location?: string;
  doctor?: string;
  notes?: string;
  isReminded: boolean;
  createdAt: string;
}

const AppointmentsScreen = () => {
  const router = useSafeRouter();
  const { userId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    doctor: '',
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
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      Alert.alert('错误', '获取复诊提醒失败');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [userId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const handleAdd = () => {
    setEditingAppointment(null);
    setFormData({
      title: '',
      date: '',
      location: '',
      doctor: '',
      notes: '',
    });
    setModalVisible(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      title: appointment.title,
      date: appointment.date,
      location: appointment.location || '',
      doctor: appointment.doctor || '',
      notes: appointment.notes || '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条复诊提醒吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/appointments/${id}`,
                {
                  method: 'DELETE',
                }
              );
              const data = await response.json();
              if (data.success) {
                await fetchAppointments();
              } else {
                Alert.alert('错误', data.message || '删除失败');
              }
            } catch (error) {
              console.error('Failed to delete appointment:', error);
              Alert.alert('错误', '删除失败');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('提示', '请输入标题');
      return;
    }
    if (!formData.date.trim()) {
      Alert.alert('提示', '请输入日期');
      return;
    }

    setLoading(true);

    try {
      const url = editingAppointment
        ? `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/appointments/${editingAppointment.id}`
        : `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/appointments`;

      const response = await fetch(url, {
        method: editingAppointment ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title: formData.title.trim(),
          date: formData.date.trim(),
          location: formData.location.trim(),
          doctor: formData.doctor.trim(),
          notes: formData.notes.trim(),
          isReminded: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setModalVisible(false);
        await fetchAppointments();
      } else {
        Alert.alert('保存失败', data.message || '请稍后重试');
      }
    } catch (error) {
      console.error('Save appointment error:', error);
      Alert.alert('保存失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>复诊提醒</Text>
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
        {appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="calendar-check" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>暂无复诊安排</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAdd}
            >
              <Text style={styles.emptyButtonText}>添加复诊提醒</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedAppointments.map((appointment) => {
            const upcoming = isUpcoming(appointment.date);
            return (
              <View
                key={appointment.id}
                style={[
                  styles.appointmentCard,
                  upcoming && styles.appointmentCardUpcoming,
                ]}
              >
                <TouchableOpacity
                  style={styles.appointmentContent}
                  onPress={() => handleEdit(appointment)}
                >
                  <View
                    style={[
                      styles.appointmentIconContainer,
                      upcoming && styles.appointmentIconContainerUpcoming,
                    ]}
                  >
                    <FontAwesome6
                      name="calendar"
                      size={28}
                      color={upcoming ? '#0D9488' : '#9CA3AF'}
                    />
                  </View>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                    <View style={styles.appointmentDetail}>
                      <FontAwesome6 name="clock" size={14} color="#6B7280" />
                      <Text style={styles.appointmentDetailText}>
                        {formatDate(appointment.date)}
                      </Text>
                    </View>
                    {appointment.location && (
                      <View style={styles.appointmentDetail}>
                        <FontAwesome6 name="location-dot" size={14} color="#6B7280" />
                        <Text style={styles.appointmentDetailText}>
                          {appointment.location}
                        </Text>
                      </View>
                    )}
                    {appointment.doctor && (
                      <View style={styles.appointmentDetail}>
                        <FontAwesome6 name="user-doctor" size={14} color="#6B7280" />
                        <Text style={styles.appointmentDetailText}>
                          {appointment.doctor}
                        </Text>
                      </View>
                    )}
                    {upcoming && (
                      <View style={styles.upcomingBadge}>
                        <FontAwesome6 name="bell" size={12} color="#0D9488" />
                        <Text style={styles.upcomingText}>即将到来</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(appointment.id)}
                >
                  <FontAwesome6 name="trash-can" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            );
          })
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
                {editingAppointment ? '编辑复诊' : '添加复诊'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome6 name="xmark" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>标题 *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="如: 血压复查"
                  placeholderTextColor="#9CA3AF"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>日期和时间 *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="如: 2024-01-15 09:00"
                  placeholderTextColor="#9CA3AF"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>地点</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="如: 某医院心内科"
                  placeholderTextColor="#9CA3AF"
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>医生</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="如: 张医生"
                  placeholderTextColor="#9CA3AF"
                  value={formData.doctor}
                  onChangeText={(text) => setFormData({ ...formData, doctor: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>备注</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputMultiline]}
                  placeholder="如: 需要空腹"
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
    </SafeAreaView>
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
  appointmentCard: {
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
  appointmentCardUpcoming: {
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  appointmentContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  appointmentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appointmentIconContainerUpcoming: {
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  appointmentDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  upcomingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0D9488',
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

export default AppointmentsScreen;
