import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { store } from "../store/store";

const InitialLayout = () => {
  const { userToken, isLoading } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();

  const [loaded, error] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (isLoading || !loaded) return;

    if (!userToken) {
      // Không có token -> chuyển đến login
      router.replace("/login");
    } else {
      // Có token -> chuyển đến tabs (nếu chưa ở đó)
      const inTabsGroup = segments[0] === "(tabs)";
      if (!inTabsGroup) {
        router.replace("/(tabs)");
      }
    }
  }, [userToken, isLoading, loaded]);

  // Hiển thị màn hình chờ trong khi auth hoặc font đang được tải
  if (isLoading || !loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Khi đã sẵn sàng, hiển thị Stack Navigator của bạn
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        {/* Tabs navigator */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Stack screens */}
        
        {/* Shipments screens */}
        <Stack.Screen name="shipments/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="shipments/dispatch-request/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="shipments/create"
          options={{ headerShown: false }}
        />
        {/* Traceability screens */}
        <Stack.Screen name="traceability" options={{ headerShown: false }} />
        {/* 404 */}
        <Stack.Screen name="+not-found" />
        {/* Auth screens */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
};

// Component RootLayout gốc giờ đây chỉ làm nhiệm vụ cung cấp Context
export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </Provider>
  );
}
