import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function CloudConsultScreen() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: '您好！我是云问诊助手，可以帮您分析身体状况并提供健康建议。请描述您的不适症状或问题。' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setMessage('');
    setIsLoading(true);

    // 模拟AI回复
    setTimeout(() => {
      let aiResponse = '';
      
      if (userMessage.includes('头痛') || userMessage.includes('头晕')) {
        aiResponse = `您描述的${userMessage.includes('头痛') ? '头痛' : '头晕'}症状可能有以下几种原因：\n\n1. 血压异常：建议您测量血压，查看是否血压过高或过低。\n2. 疲劳过度：注意休息，保证充足睡眠。\n3. 颈椎问题：长期低头可能导致颈椎不适。\n\n建议：先测量血压，如持续不适建议及时就医。`;
      } else if (userMessage.includes('血压')) {
        aiResponse = `关于血压问题，我建议您：\n\n1. 定期测量血压，建议每天早晚各一次。\n2. 如收缩压持续高于140mmHg或舒张压高于90mmHg，请及时就医。\n3. 低盐低脂饮食，适量运动。\n4. 避免情绪激动和过度疲劳。\n\n${user?.medicalHistory ? `根据您的病历（${user.medicalHistory}），需要特别注意血压控制。` : '建议您完善病历信息以便提供更精准的建议。'}`;
      } else if (userMessage.includes('血糖') || userMessage.includes('糖尿病')) {
        aiResponse = `关于血糖问题，我建议您：\n\n1. 空腹血糖正常范围：3.9-6.1 mmol/L\n2. 餐后2小时血糖正常范围：≤7.8 mmol/L\n3. 控制碳水化合物摄入，避免高糖食物。\n4. 规律运动，每周至少150分钟中等强度运动。\n\n如血糖持续异常，请及时就医并遵医嘱用药。`;
      } else if (userMessage.includes('药') || userMessage.includes('服用')) {
        aiResponse = `关于用药问题，我建议您：\n\n1. 严格按照医嘱剂量和时间服药。\n2. 不要随意停药或更改剂量。\n3. 如有不良反应，请立即停药并就医。\n4. 建议在「用药清单」中设置提醒时间，避免漏服。${user?.doctorNotes ? `\n\n您的医嘱：${user.doctorNotes}` : ''}`;
      } else {
        aiResponse = `感谢您的描述。为了更好地为您提供帮助，我需要了解更多信息：\n\n1. 您的具体症状是什么？持续多长时间了？\n2. 是否有既往病史？${user?.medicalHistory ? `（您的病历：${user.medicalHistory}）` : ''}\n3. 最近是否有服用药物？\n4. 症状是否影响您的日常生活？\n\n如症状严重或持续加重，建议您及时就医。`;
      }

      setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleEmergencyCall = () => {
    if (!user?.emergencyPhone) {
      router.push('/profile', {});
      return;
    }
    router.push('/appointments', {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* 顶部导航 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <FontAwesome6 name="arrow-left" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>云问诊</Text>
            <TouchableOpacity onPress={handleEmergencyCall}>
              <FontAwesome6 name="phone" size={20} color="#0D9488" />
            </TouchableOpacity>
          </View>

          {/* 免责声明 */}
          <View style={styles.disclaimer}>
            <FontAwesome6 name="info-circle" size={14} color="#F59E0B" />
            <Text style={styles.disclaimerText}>
              本服务仅供参考，不作为诊断依据。如症状严重请及时就医
            </Text>
          </View>

          {/* 消息列表 */}
          <ScrollView
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                ]}
              >
                {msg.role === 'assistant' && (
                  <View style={styles.assistantIcon}>
                    <FontAwesome6 name="robot" size={16} color="#FFFFFF" />
                  </View>
                )}
                <Text style={[styles.messageText, msg.role === 'user' && styles.userMessageText]}>{msg.content}</Text>
              </View>
            ))}
            {isLoading && (
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color="#0D9488" />
                <Text style={styles.loadingText}>正在分析...</Text>
              </View>
            )}
          </ScrollView>

          {/* 快捷问题 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickQuestions}
          >
            {['我头晕头痛', '血压高怎么办', '血糖正常范围', '忘记吃药了怎么办'].map((question) => (
              <TouchableOpacity
                key={question}
                style={styles.quickQuestionTag}
                onPress={() => {
                  setMessage(question);
                  handleSendMessage();
                }}
              >
                <FontAwesome6 name="comment-dots" size={14} color="#0D9488" />
                <Text style={styles.quickQuestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 输入区域 */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="描述您的问题或症状..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!message.trim() || isLoading}
            >
              <FontAwesome6 name="paper-plane" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    margin: 12,
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
  },
  messagesContainer: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    maxWidth: '85%',
  },
  assistantMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userMessage: {
    backgroundColor: '#0D9488',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  quickQuestions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  quickQuestionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickQuestionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
