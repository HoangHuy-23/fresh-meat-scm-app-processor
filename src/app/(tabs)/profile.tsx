import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";

type MenuItem = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  screen?: string;
  color?: string;
};

const ProfileScreen = () => {
  const { userToken, logout } = useAuth();
  const userInfo = useMemo(() => {
    if (!userToken) return { name: "Guest User", email: "guest@example.com" };
    const email = userToken.split("-")[4] || "Không có email";
    const name = email
      .split("@")[0]
      .replace(/\./g, " ")
      .replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) =>
        letter.toUpperCase()
      );

    return { name, email };
  }, [userToken]);

  const menuItems: MenuItem[] = [
    { icon: "edit", title: "Chỉnh sửa hồ sơ", screen: "/profile/edit" },
    { icon: "settings", title: "Cài đặt", screen: "/settings" },
    { icon: "help-circle", title: "Trợ giúp & Hỗ trợ", screen: "/help" },
    { icon: "shield", title: "Chính sách bảo mật", screen: "/privacy" },
  ];

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "OK",
        onPress: () => {
          logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.screen) {
      Alert.alert("Thông báo", `Điều hướng đến màn hình: ${item.title}`);
    } else {
      Alert.alert(
        "Thông báo",
        `Chức năng "${item.title}" đang được phát triển.`
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView>
        <View className="items-center p-6 bg-primary">
          <Image
            source={{ uri: `https://i.pravatar.cc/150?u=${userInfo.email}` }}
            className="w-28 h-28 rounded-full border-4 border-white mb-4 mt-6"
          />
          <Text className="text-2xl font-bold text-white">{userInfo.name}</Text>
          <Text className="text-base text-indigo-200">{userInfo.email}</Text>
        </View>

        <View className="p-4">
          <View className="bg-white rounded-lg shadow-md">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleMenuItemPress(item)}
                className={`flex-row items-center p-4 ${
                  index < menuItems.length - 1 ? "border-b border-gray-200" : ""
                }`}
                activeOpacity={0.7}
              >
                <Feather
                  name={item.icon}
                  size={22}
                  color={item.color || "#4B5563"}
                />
                <Text className="text-base text-gray-800 ml-4 flex-1">
                  {item.title}
                </Text>
                <Feather name="chevron-right" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
          <View className="mt-6 bg-white rounded-lg shadow-md">
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center p-4"
              activeOpacity={0.7}
            >
              <Feather name="log-out" size={22} color="#EF4444" />
              <Text className="text-base text-red-500 ml-4 font-semibold">
                Đăng xuất
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
