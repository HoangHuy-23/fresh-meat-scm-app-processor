import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TraceabilityApi } from "../api/traceabilityApi";
import HistoryStep from "../components/tracebility/HistoryStep";
import { TraceabilityData } from "../types/traceability";

const ProductTraceabilityScreen = () => {
  const [unitData, setUnitData] = React.useState<TraceabilityData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const route = useRoute();
  const router = useRouter();
  const { unitId } = route.params as { unitId: string };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TraceabilityApi.getTraceabilityData(unitId);
      setUnitData(response);
    } catch (error) {
      console.error("Error fetching traceability data:", error);
      setError(
        "Không thể tải thông tin truy xuất nguồn gốc. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  React.useEffect(() => {
    fetchData();
  }, [unitId, fetchData]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="mt-4 text-gray-600">Đang tải thông tin...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !unitData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-xl font-bold text-gray-800 mt-4 text-center">
          Không thể tải dữ liệu
        </Text>
        <Text className="text-gray-600 mt-2 text-center">{error}</Text>
        <TouchableOpacity
          onPress={fetchData}
          className="mt-6 bg-green-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // No data state
  if (!unitData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Ionicons name="document-text-outline" size={64} color="#6B7280" />
        <Text className="text-xl font-bold text-gray-800 mt-4 text-center">
          Không tìm thấy thông tin
        </Text>
        <Text className="text-gray-600 mt-2 text-center">
          Không có dữ liệu truy xuất cho sản phẩm này
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <View className="">
            <Text className="text-2xl font-bold text-gray-900">
              {unitData.productName}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Mã sản phẩm: {unitData.assetID}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} className="">
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        {unitData.fullHistory.map((event, index) =>
          event.type === "CREATED_FROM_PROCESSING" ||
          event.type === "CREATED_AS_UNIT" ||
          event.type === "ALLOCATED_FOR_SHIPMENT" ? null : (
            <HistoryStep
              key={event.txID}
              event={event}
              isLast={index === unitData.fullHistory.length - 1}
            />
          )
        )}

        {/* Empty history state */}
        {unitData.fullHistory.filter(
          (event) =>
            event.type !== "CREATED_FROM_PROCESSING" &&
            event.type !== "CREATED_AS_UNIT" &&
            event.type !== "ALLOCATED_FOR_SHIPMENT"
        ).length === 0 && (
          <View className="items-center mt-8">
            <Ionicons name="time-outline" size={48} color="#6B7280" />
            <Text className="text-gray-600 mt-2">
              Chưa có lịch sử truy xuất
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductTraceabilityScreen;
