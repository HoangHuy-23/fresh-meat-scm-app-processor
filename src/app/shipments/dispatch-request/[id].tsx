// src/app/shipments/[id].tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "axios";
import { shipmentApi } from "@/src/api/shipmentApi";

// --- TypeScript Interfaces for API data ---
interface Item {
  assetID: string;
  quantity: {
    unit: string;
    value: number;
  };
}

interface DispatchRequest {
  id: string;
  requestID: string;
  fromFacilityID: string;
  items: Item[];
  status: "PENDING" | "PROCESSED" | "COMPLETED" | "REJECTED" | "SHIPPING";
  createdBy: string;
  createdAt: string;
}

// --- UI Configuration for Status ---
const statusConfig: Record<string, { color: string; text: string }> = {
  PENDING: { color: "bg-yellow-500", text: "Chờ xử lý" },
  PROCESSED: { color: "bg-blue-500", text: "Đã xử lý" },
  SHIPPING: { color: "bg-cyan-500", text: "Đang giao" },
  COMPLETED: { color: "bg-green-600", text: "Hoàn thành" },
  REJECTED: { color: "bg-red-500", text: "Đã hủy" },
};

// --- Helper Component for Info Rows ---
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
    <Text className="text-gray-500">{label}</Text>
    <Text className="font-semibold text-gray-800">{value}</Text>
  </View>
);

export default function DispatchRequestDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<DispatchRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequestDetail = useCallback(async () => {
    try {
      if (!id) return;
      const response = await shipmentApi.getDispatchRequestById(id as string);
      setRequest(response);
    } catch (err) {
      console.error(err);
      setError("Không thể tải chi tiết yêu cầu.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequestDetail();
  }, [fetchRequestDetail]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#28A745" />
      </View>
    );
  }

  if (error || !request) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = statusConfig[request.status] || {
    color: "bg-gray-500",
    text: request.status,
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-10 pb-4 bg-primary flex-row items-center space-x-4 shadow-md">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">
          Chi tiết yêu cầu
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Basic Info Card */}
        <View className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-xl font-bold text-primary w-4/5">
              {request.requestID}
            </Text>
            <View className={`px-3 py-1 rounded-full ${statusInfo.color}`}>
              <Text className="text-white text-xs font-bold">{statusInfo.text}</Text>
            </View>
          </View>
          <InfoRow
            label="Ngày tạo"
            value={new Date(request.createdAt).toLocaleString("vi-VN")}
          />
          <InfoRow label="Nguồn" value={request.fromFacilityID} />
          <InfoRow label="Người tạo" value={request.createdBy} />
        </View>

        {/* Items List Card */}
        <View className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <Text className="text-lg font-bold mb-3">Các lô hàng trong yêu cầu</Text>
          {request.items.map((item, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center bg-gray-50 p-3 rounded-lg mb-2"
            >
              <Text className="font-semibold text-gray-700">{item.assetID}</Text>
              <Text className="text-gray-600">
                {item.quantity.value} {item.quantity.unit}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Update Button: Only show if status is PENDING */}
      {request.status === "PENDING" && (
        <TouchableOpacity
          onPress={() => router.push(`/shipments/update/${request.id}`)}
          className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        >
          <MaterialCommunityIcons name="pencil" size={26} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}