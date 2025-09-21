import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext'; // <-- Điều chỉnh đường dẫn nếu cần
import { loginUser } from '../hooks/useAuth';
import { AppDispatch, RootState } from '../store/store';


const LoginScreen = () => {
  const { login, setUserProfile } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error, token, user } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('worker1@processorB.com');
  const [password, setPassword] = useState('123456');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (status === 'succeeded' && token && user) {
      login(token);
      setUserProfile(user);
    }
    if (status === 'failed' && error) {
      Alert.alert('Đăng nhập thất bại', error);
    }
  }, [status, token, error, login, setUserProfile]);

  const isLoading = status === 'loading';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center items-center p-6">
          <Image
            source={require('../../assets/images/logo.jpeg')}
            className="w-60 h-60"
          />
          <Text className="text-3xl font-bold text-gray-800">Chào mừng trở lại!</Text>
          <Text className="text-base text-gray-500 mb-10">Đăng nhập để tiếp tục</Text>

          <View className="w-full">
            <TextInput
              className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg p-4 w-full mb-4 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Email của bạn"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              className="bg-white border border-gray-300 text-gray-900 text-base rounded-lg p-4 w-full mb-6 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`w-full rounded-lg py-4 ${isLoading ? 'bg-primary-light' : 'bg-primary'}`}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">Đăng nhập</Text>
              )}
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center w-full mt-4">
            <TouchableOpacity>
              <Text className="text-primary font-semibold">Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
