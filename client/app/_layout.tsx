import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import Provider from '@/components/Provider';
import { AuthProvider } from '@/contexts/AuthContext';

import '../global.css';

LogBox.ignoreLogs([
  "TurboModuleRegistry.getEnforcing(...): 'RNMapsAirModule' could not be found",
]);

export default function RootLayout() {
  return (
    <Provider>
      <AuthProvider>
        <Stack
          screenOptions={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            headerShown: false
          }}
        >
          <Stack.Screen name="index" options={{ title: "云用药" }} />
          <Stack.Screen name="(tabs)" options={{ title: "云用药" }} />
          <Stack.Screen name="login" options={{ title: "登录注册", animation: 'slide_from_bottom' }} />
          <Stack.Screen name="profile" options={{ title: "个人信息", animation: 'slide_from_right' }} />
          <Stack.Screen name="health-record" options={{ title: "健康记录", animation: 'slide_from_right' }} />
          <Stack.Screen name="diet-search" options={{ title: "饮食查询", animation: 'slide_from_right' }} />
          <Stack.Screen name="medications" options={{ title: "用药清单", animation: 'slide_from_right' }} />
          <Stack.Screen name="cloud-consult" options={{ title: "云问诊", animation: 'slide_from_right' }} />
          <Stack.Screen name="appointments" options={{ title: "复诊提醒", animation: 'slide_from_right' }} />
          <Stack.Screen name="add-record" options={{ title: "添加记录", animation: 'slide_from_bottom' }} />
          <Stack.Screen name="add-medication" options={{ title: "添加用药", animation: 'slide_from_bottom' }} />
          <Stack.Screen name="add-appointment" options={{ title: "添加预约", animation: 'slide_from_bottom' }} />
        </Stack>
        <Toast />
        <StatusBar style="dark" />
      </AuthProvider>
    </Provider>
  );
}
