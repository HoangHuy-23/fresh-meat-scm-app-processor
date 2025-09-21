// src/app/(tabs)/shipments.tsx
import { shipmentApi } from "@/src/api/shipmentApi";
import { useAuth } from "@/src/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- TypeScript Interfaces ---

// For Dispatch Requests (Tab 1)
interface DispatchRequest {
  id: string;
  requestID: string;
  items: Array<{ quantity: { value: number } }>;
  status: string;
  createdAt: string;
}

// Processed data structure for easy rendering
interface ProcessedShipment {
  id: string;
  driverName: string;
  vehiclePlate: string;
  status: string;
  date: string;
  totalQuantity: number;
  itemCount: number;
}

// --- UI Configuration ---
const statusConfig: Record<string, { color: string; text: string }> = {
  // Dispatch Request Statuses
  PENDING: { color: "bg-yellow-500", text: "Chờ xử lý" },
  PROCESSED: { color: "bg-blue-500", text: "Đã xử lý" },
  // Shipment Statuses
  IN_TRANSIT: { color: "bg-sky-500", text: "Đang vận chuyển" },
  COMPLETED: { color: "bg-green-600", text: "Hoàn thành" },
  REJECTED: { color: "bg-red-500", text: "Đã hủy" },
};

export default function Shipments() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("requests");
  const { user } = useAuth();

  // State for Tab 1
  const [requests, setRequests] = useState<DispatchRequest[]>([]);

  // State for Tab 2
  const [pickups, setPickups] = useState<ProcessedShipment[]>([]);

  // Common State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // --- Data Fetching Logic ---

  const fetchDispatchRequests = useCallback(async () => {
    try {
      const response = await shipmentApi.getMyDispatchRequests();
      const sortedData = response.sort(
        (a: DispatchRequest, b: DispatchRequest) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRequests(sortedData);
    } catch (err) {
      throw new Error("Không thể tải danh sách yêu cầu.");
    }
  }, []);

  const fetchPickingUpShipments = useCallback(async () => {
    // IMPORTANT: Replace with the actual ID of the current user's processor
    const MY_PROCESSOR_ID = user?.facilityID || "unknown_processor_id";

    try {
      const response = await shipmentApi.getMyPickupShipments(MY_PROCESSOR_ID);

      const processedData = response
        .map((shipment: any): ProcessedShipment | null => {
          // Find the specific stop at our processor where a pickup is scheduled
          const pickupStop = shipment.stops.find(
            (stop: any) =>
              stop.facilityID === MY_PROCESSOR_ID && stop.action === "PICKUP"
          );

          // If there's no such stop, this shipment is not for us
          if (!pickupStop) {
            return null;
          }

          const totalQuantity = pickupStop.items.reduce(
            (sum: number, item: any) => sum + item.quantity.value,
            0
          );

          return {
            id: shipment.shipmentID,
            driverName: shipment.driverName,
            vehiclePlate: shipment.vehiclePlate,
            status: shipment.status,
            date: shipment.history[0]?.timestamp || new Date().toISOString(),
            totalQuantity,
            itemCount: pickupStop.items.length,
          };
        })
        .filter((p: any): p is ProcessedShipment => p !== null) // Remove null entries
        // .filter((p: ProcessedShipment) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED') // Only show active shipments
        .sort(
          (a: ProcessedShipment, b: ProcessedShipment) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      setPickups(processedData);
    } catch (err) {
      throw new Error("Không thể tải danh sách tài xế đang đến.");
    }
  }, []);

  const loadDataForTab = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "requests") {
        await fetchDispatchRequests();
      } else {
        await fetchPickingUpShipments();
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, fetchDispatchRequests, fetchPickingUpShipments]);

  useFocusEffect(
    useCallback(() => {
      loadDataForTab();
    }, [loadDataForTab])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDataForTab();
  };

  // --- Render Functions ---

  const renderStatusBadge = (status: string) => {
    const config = statusConfig[status] || {
      color: "bg-gray-500",
      text: status,
    };
    return (
      <View className={`px-3 py-1 rounded-full ${config.color}`}>
        <Text className="text-white text-xs font-bold capitalize">
          {config.text}
        </Text>
      </View>
    );
  };

  const renderRequestItem = ({ item }: { item: DispatchRequest }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: `/shipments/dispatch-request/[id]`,
          params: { id: item.requestID },
        })
      }
      className="bg-white p-4 mb-3 rounded-2xl shadow-sm"
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-bold text-lg">{item.requestID}</Text>
        {renderStatusBadge(item.status)}
      </View>
      <Text className="text-gray-600">Số lô hàng: {item.items.length}</Text>
      <Text className="text-gray-600">
        Tổng số lượng: {item.items.reduce((s, i) => s + i.quantity.value, 0)}{" "}
        con
      </Text>
      <Text className="text-gray-400 text-xs mt-2">
        Ngày yêu cầu: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
      </Text>
    </TouchableOpacity>
  );

  const renderShipmentItem = ({ item }: { item: ProcessedShipment }) => (
    <TouchableOpacity className={`bg-white p-4 mb-3 rounded-2xl shadow-sm`}
      onPress={() =>
        router.push({
          pathname: `/shipments/[id]`,
          params: { id: item.id },
        })
      }
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-bold text-lg">{item.id}</Text>
        {renderStatusBadge(item.status)}
      </View>
      <View className="mt-2 pt-2 border-t border-gray-100">
        <Text className="text-gray-800 font-semibold">
          Tài xế: {item.driverName}
        </Text>
        <Text className="text-gray-600">Biển số xe: {item.vehiclePlate}</Text>
        <Text className="text-gray-600">
          Tổng số lượng: {item.totalQuantity} con
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <ActivityIndicator size="large" color="#28A745" className="mt-8" />
      );
    }
    if (error) {
      return <Text className="text-center mt-8 text-red-500">{error}</Text>;
    }

    if (activeTab === "requests") {
      return (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text className="text-center mt-8 text-gray-500">
              Chưa có yêu cầu nào.
            </Text>
          }
        />
      );
    } else {
      return (
        <FlatList
          data={pickups}
          renderItem={renderShipmentItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text className="text-center mt-8 text-gray-500">
              Không có tài xế nào đang đến.
            </Text>
          }
        />
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-10 pb-2 bg-primary shadow-md">
        <Text className="text-white font-bold text-xl">Vận chuyển</Text>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row p-2 bg-gray-100">
        <TouchableOpacity
          onPress={() => setActiveTab("requests")}
          className={`flex-1 py-2 rounded-lg ${activeTab === "requests" ? "bg-primary" : ""}`}
        >
          <Text
            className={`text-center font-semibold ${activeTab === "requests" ? "text-white" : "text-gray-600"}`}
          >
            Yêu cầu xuất lô
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("pickingUp")}
          className={`flex-1 py-2 rounded-lg ${activeTab === "pickingUp" ? "bg-primary" : ""}`}
        >
          <Text
            className={`text-center font-semibold ${activeTab === "pickingUp" ? "text-white" : "text-gray-600"}`}
          >
            Chuyến hàng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Content */}
      {renderContent()}

      {/* Create Button */}
      <TouchableOpacity
        onPress={() => router.push("/shipments/create")}
        className="absolute bottom-6 right-6 bg-primary w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
      >
        <MaterialCommunityIcons name="plus" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
