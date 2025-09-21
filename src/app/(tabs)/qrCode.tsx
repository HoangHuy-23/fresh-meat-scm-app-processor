import { shipmentApi } from "@/src/api/shipmentApi";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Button,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function QRCode() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const router = useRouter();
  const isFocused = useIsFocused();

  // Reset khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setScannedData(null);
    }, [])
  );

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <Text className="text-center text-base mb-4">
          Vui lòng cấp quyền truy cập camera để quét mã QR.
        </Text>
        <Button onPress={requestPermission} title="Cấp quyền" />
      </View>
    );
  }

  // Hàm xử lý khi quét được mã
  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (!scanned) {
      setScanned(true);

      try {
        // Parse JSON từ chuỗi data
        const parsed = JSON.parse(data);

        // Lấy các field chính
        const shipmentID = parsed.shipmentID;
        const facilityID = parsed.facilityID;
        const action = parsed.action;

        // Lấy chi tiết item (ở đây chỉ có 1 item, nhưng có thể nhiều)
        const items = parsed.items || [];
        const firstItem = items[0]; // lấy item đầu tiên
        const assetID = firstItem?.assetID;
        const quantityValue = firstItem?.quantity?.value;
        const quantityUnit = firstItem?.quantity?.unit;

        // call API xác nhận đã nhận lô hàng
        const confirmPickup = async () => {
          try {
            const response = await shipmentApi.confirmPickupShipment(shipmentID, {
              facilityID,
              actualItems: [
                {
                  assetID,
                  quantity: {
                    value: quantityValue,
                    unit: quantityUnit,
                  },
                },
              ],
            });
            console.log("Confirm pickup response:", response);
            Alert.alert("Thành công", "Đã xác nhận nhận lô hàng");
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xác nhận nhận lô hàng");
            console.error("Confirm pickup error:", error);
          }
        };
        confirmPickup();
      } catch (err) {
        Alert.alert("Lỗi", "Không thể phân tích dữ liệu QR");
        console.error("Parse QR error:", err);
      }
    }
  };

  // Hàm để quét lại
  const handleScanAgain = () => {
    setScanned(false);
    setScannedData(null);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Camera background */}
      {isFocused && (
        <CameraView
          style={{ flex: 1 }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          facing="back"
        />
      )}

      {/* Overlay */}
      <View className="absolute inset-0 justify-between items-center">
        {/* Header */}
        <View className="w-full items-center bg-black/60 pt-5">
          <Text className="text-2xl font-bold text-white p-4">Quét mã QR</Text>
        </View>

        {/* Viewfinder */}
        <View className="w-[250px] h-[250px] justify-center items-center">
          <View className="absolute top-0 left-0 w-10 h-10 border-t-[5px] border-l-[5px] border-white" />
          <View className="absolute top-0 right-0 w-10 h-10 border-t-[5px] border-r-[5px] border-white" />
          <View className="absolute bottom-0 left-0 w-10 h-10 border-b-[5px] border-l-[5px] border-white" />
          <View className="absolute bottom-0 right-0 w-10 h-10 border-b-[5px] border-r-[5px] border-white" />
        </View>

        {/* Footer */}
        <View className="w-full items-center bg-black/60 pb-10">
          {scanned ? (
            <>
              <Text className="text-white text-base text-center p-5 font-bold">
                Dữ liệu: {scannedData}
              </Text>
              <TouchableOpacity
                className="bg-blue-500 py-3 px-8 rounded-lg"
                onPress={handleScanAgain}
              >
                <Text className="text-white text-lg font-bold">Quét lại</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-white text-base text-center p-5">
                Di chuyển camera đến gần mã QR để quét
              </Text>
              <TouchableOpacity
                className="bg-blue-500 py-3 px-8 rounded-lg"
                onPress={() => router.back()} 
              >
                <Text className="text-white text-lg font-bold">Hủy</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
