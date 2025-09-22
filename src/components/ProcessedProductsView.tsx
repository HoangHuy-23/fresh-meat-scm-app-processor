// src/components/ProcessedProductsView.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProcessedAssets } from "../hooks/useAssets";
import { AppDispatch, RootState } from "../store/store";

export default function ProcessedProductsView() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { processed, status, error } = useSelector(
    (state: RootState) => state.assets
  );

  // State để kiểm soát indicator loading khi "kéo để làm mới"
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dữ liệu lần đầu tiên component được tải
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProcessedAssets());
    }
  }, [status, dispatch]);

  // Hàm xử lý logic khi người dùng kéo để làm mới danh sách
  const onRefresh = useCallback(async () => {
    setRefreshing(true); // Bật indicator loading
    try {
      // Gọi lại action fetch dữ liệu
      await dispatch(fetchProcessedAssets());
    } catch (e) {
      console.error("Lỗi khi làm mới danh sách sản phẩm đã chế biến:", e);
    } finally {
      setRefreshing(false); // Luôn tắt indicator sau khi hoàn tất
    }
  }, [dispatch]);

  // Chỉ hiển thị loading toàn màn hình cho lần tải đầu tiên,
  // không phải khi đang refresh
  if (status === "loading" && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // Xử lý khi có lỗi xảy ra
  if (status === "failed") {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Lỗi: {error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-4 py-2">
      <FlatList
        data={processed}
        keyExtractor={(item) => item.assetID}
        // Thêm props cho tính năng "kéo để làm mới"
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <View className="bg-gray-100 rounded-2xl p-4 mb-3 shadow-sm">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-bold text-gray-800">
                {item.productName}
              </Text>
              <View className="px-2 py-1 bg-primary rounded-full">
                <Text className="text-xs text-white font-semibold">
                  {item.status === "PACKAGED"
                    ? "Đã đóng gói"
                    : item.status === "STORED"
                    ? "Đang lưu kho"
                    : item.status}
                </Text>
              </View>
            </View>

            {/* Thông tin chi tiết */}
            <Text className="text-sm text-gray-600">
              Mã sản phẩm: {item.assetID}
            </Text>
            <Text className="text-sm text-gray-600">
              Tồn kho: {item.currentQuantity.value} {item.currentQuantity.unit}
            </Text>
            <Text className="text-sm text-gray-600">
              Xuất xứ: {item.parentAssetIDs.join(", ")}
            </Text>
            <Text className="text-sm text-gray-600">
              Chủ sở hữu: {item.ownerOrg}
            </Text>

            {/* Lịch sử gần nhất */}
            {item.history?.length > 0 && (
              <View className="mt-2">
                <Text className="text-xs text-gray-500">
                  {String(item.history[0].details)} •{" "}
                  {new Date(item.history[0].timestamp).toLocaleString("vi-VN")}
                </Text>
              </View>
            )}

            {/* Action buttons */}
            <View className="flex-row mt-3 justify-end space-x-3 gap-2">
              <TouchableOpacity
                className="flex-row items-center bg-primary px-3 py-2 rounded-full"
                onPress={() =>
                  router.push(`/shipments/create?assetID=${item.assetID}`)
                }
              >
                <MaterialCommunityIcons
                  name="truck-delivery-outline"
                  size={18}
                  color="#fff"
                />
                <Text className="text-white text-sm font-medium ml-1">
                  Xuất kho
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center bg-gray-300 px-3 py-2 rounded-full"
                onPress={() => router.push(`/traceability?unitId=${item.assetID}`)}
              >
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={18}
                  color="#333"
                />
                <Text className="text-gray-800 text-sm font-medium ml-1">
                  Truy xuất
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        // Hiển thị thông báo khi danh sách rỗng
        ListEmptyComponent={
            <Text className="text-center mt-8 text-gray-500">
              Không có sản phẩm đã chế biến. Hãy kiểm tra lại sau!
            </Text>
          }
      />
    </View>
  );
}