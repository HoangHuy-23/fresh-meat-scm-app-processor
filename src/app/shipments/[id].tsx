// src/app/shipments/[id].tsx
import { shipmentApi } from "@/src/api/shipmentApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- TypeScript Interfaces ---
interface ShipmentStop {
  facilityID: string;
  facilityName: string;
  action: "PICKUP" | "DELIVERY";
  status: "PENDING" | "COMPLETED";
  items: Array<{ assetID: string; quantity: { value: number; unit: string } }>;
}

interface ShipmentAsset {
  shipmentID: string;
  driverName: string;
  vehiclePlate: string;
  status: string;
  stops: ShipmentStop[];
}

// --- UI Configuration ---
const statusConfig: Record<string, { color: string; text: string }> = {
  PENDING: { color: "bg-yellow-500", text: "Chờ xử lý" },
  IN_TRANSIT: { color: "bg-sky-500", text: "Đang vận chuyển" },
  COMPLETED: { color: "bg-green-600", text: "Hoàn thành" },
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
    <Text className="text-gray-500">{label}</Text>
    <Text className="font-semibold text-gray-800 text-right">{value}</Text>
  </View>
);

export default function ShipmentDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [shipment, setShipment] = useState<ShipmentAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MY_FARM_ID = "farm-a"; // IMPORTANT: Replace with dynamic farm ID

  const fetchShipmentDetail = useCallback(async () => {
    try {
      if (!id) return;
      // Giả định endpoint chi tiết shipment
      const response = await shipmentApi.getShipmentById(id as string);
      setShipment(response);
    } catch (err) {
      setError("Không thể tải chi tiết chuyến hàng.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShipmentDetail();
  }, [fetchShipmentDetail]);

  if (loading) return <ActivityIndicator size="large" className="flex-1" />;
  if (error || !shipment)
    return <Text className="text-center mt-10 text-red-500">{error}</Text>;

  const statusInfo = statusConfig[shipment.status] || {
    color: "bg-gray-500",
    text: shipment.status,
  };
  const pickupStop = shipment.stops.find(
    (s) => s.facilityID === MY_FARM_ID && s.action === "PICKUP"
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-10 pb-4 bg-primary flex-row items-center space-x-4 shadow-md">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">
          Chi tiết chuyến hàng
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Basic Info */}
        <View className="bg-white p-4 rounded-2xl shadow-sm mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-xl font-bold text-primary w-4/5">
              {shipment.shipmentID}
            </Text>
            <View className={`px-3 py-1 rounded-full ${statusInfo.color}`}>
              <Text className="text-white text-xs font-bold">
                {statusInfo.text}
              </Text>
            </View>
          </View>
          <InfoRow label="Tài xế" value={shipment.driverName} />
          <InfoRow label="Biển số xe" value={shipment.vehiclePlate} />
        </View>

        {/* Pickup Details */}
        {pickupStop && (
          <View className="bg-white p-4 rounded-2xl shadow-sm mb-6">
            <Text className="text-lg font-bold mb-3">
              Hàng hóa cần bàn giao
            </Text>
            {pickupStop.items.map((item, index) => (
              <View
                key={index}
                className="flex-row justify-between items-center bg-gray-50 p-3 rounded-lg mb-2"
              >
                <Text className="font-semibold text-gray-700">
                  {item.assetID}
                </Text>
                <Text className="text-gray-600">
                  {item.quantity.value} {item.quantity.unit}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Confirmation Button */}
      {pickupStop?.status === "PENDING" && (
        <View className="p-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            onPress={() => router.push(`/qrCode`)}
            className="bg-primary rounded-2xl py-4 flex-row justify-center items-center space-x-2"
          >
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={22}
              color="white"
            />
            <Text className="text-center text-white font-bold text-lg">
              Xác nhận bàn giao (QR)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
