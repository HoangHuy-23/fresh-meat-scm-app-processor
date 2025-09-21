// src/components/MaterialView.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert, // Thêm Alert để thông báo tốt hơn
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AssetsApi } from "../api/assetsApi";
import { fetchProcessedAssets, fetchUnprocessedAssets } from "../hooks/useAssets";
import { AppDispatch, RootState } from "../store/store";

// Định nghĩa kiểu dữ liệu rõ ràng hơn cho state (tùy chọn nhưng nên có)
interface ChildAsset {
  id: string;
  assetID: string;
  productName: string;
  quantity: { value: string; unit: string };
}

interface ProcessStep {
  id: string;
  name: string;
  timestamp: string;
}

export default function MaterialView() {
  const dispatch = useDispatch<AppDispatch>();
  const { unprocessed, status, error } = useSelector(
    (state: RootState) => state.assets
  );

  // State cho tính năng "kéo để làm mới"
  const [refreshing, setRefreshing] = useState(false);

  // State cho Modal và item được chọn
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // State cho form chế biến
  const [facilityName, setFacilityName] = useState("Nhà máy B");
  const [childAssets, setChildAssets] = useState<ChildAsset[]>([]);
  const [steps, setSteps] = useState<ProcessStep[]>([]);

  // Fetch dữ liệu lần đầu
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUnprocessedAssets());
    }
  }, [status, dispatch]);

  // Hàm xử lý "kéo để làm mới"
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchUnprocessedAssets());
    } catch (e) {
      console.error("Lỗi khi làm mới:", e);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Random mã cho sản phẩm con
  const generateRandomAssetID = () => {
    return 'PC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  // Mở và khởi tạo modal
  const handleOpenProcess = (asset: any) => {
    setSelectedAsset(asset);
    setChildAssets([
      { id: "1", assetID: generateRandomAssetID(), productName: "", quantity: { value: "", unit: "" } },
    ]);
    setSteps([{ id: "1", name: "", timestamp: new Date().toISOString() }]);
    setModalVisible(true);
  };

  // Xử lý logic submit form
  const handleSubmitProcess = async () => {
    if (!selectedAsset) return;

    // Validate form
    if (childAssets.some(c => !c.productName || !c.quantity.value || !c.quantity.unit) || steps.some(s => !s.name)) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin cho sản phẩm con và các bước chế biến.");
      return;
    }

    const body = {
      parentAssetID: selectedAsset.assetID,
      childAssets: childAssets.map((c) => ({
        assetID: c.assetID,
        productName: c.productName,
        quantity: {
          unit: c.quantity.unit,
          value: parseInt(c.quantity.value, 10),
        },
      })),
      details: {
        processorOrgName: "processor-b",
        facilityName: facilityName,
        steps: steps.map((s) => ({
          name: s.name,
          timestamp: s.timestamp,
        })),
      },
    };

    try {
      const res = await AssetsApi.processAsset(body);
      if (!res) throw new Error("Phản hồi từ server không hợp lệ");

      Alert.alert("Thành công", "Chế biến lô hàng thành công!");
      setModalVisible(false);
      // Tải lại dữ liệu cho cả hai tab để đảm bảo tính nhất quán
      dispatch(fetchUnprocessedAssets());
      dispatch(fetchProcessedAssets());
    } catch (err: any) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chế biến: " + err.message);
    }
  };

  // ----- Các hàm xử lý thêm/xóa item trong form -----

  const handleAddChildAsset = () => {
    setChildAssets([
      ...childAssets,
      { id: Date.now().toString(), assetID: generateRandomAssetID(), productName: "", quantity: { value: "", unit: "" } },
    ]);
  };

  const handleDeleteChild = (id: string) => {
    setChildAssets((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddStep = () => {
    setSteps([...steps, { id: Date.now().toString(), name: "", timestamp: new Date().toISOString() }]);
  };

  const handleDeleteStep = (id: string) => {
    setSteps((prev) => prev.filter((item) => item.id !== id));
  };
  
  // ----- Xử lý các trạng thái UI -----

  // Chỉ hiển thị loading toàn màn hình cho lần tải đầu tiên
  if (status === "loading" && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

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
        data={unprocessed}
        keyExtractor={(item) => item.assetID}
        // Props cho tính năng "kéo để làm mới"
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <View className="bg-gray-100 rounded-2xl p-4 mb-3 shadow-sm">
            <Text className="text-base font-semibold text-gray-800">
              {item.productName}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Số lượng: {item.currentQuantity.value} {item.currentQuantity.unit}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              Mã lô: {item.assetID}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Trạng thái: {item.status}
            </Text>

            <View className="flex-row mt-3 justify-end space-x-3 gap-2">
              <TouchableOpacity
                onPress={() => handleOpenProcess(item)}
                className="flex-row items-center bg-primary px-3 py-2 rounded-full"
              >
                <MaterialCommunityIcons name="knife" size={18} color="#fff" />
                <Text className="text-white text-sm font-medium ml-1">
                  Chế biến
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center bg-gray-300 px-3 py-2 rounded-full">
                <MaterialCommunityIcons name="qrcode-scan" size={18} color="#333" />
                <Text className="text-gray-800 text-sm font-medium ml-1">
                  Truy xuất
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
            <Text className="text-center mt-8 text-gray-500">
              Không có nguyên liệu chưa chế biến. Hãy kiểm tra lại sau!
            </Text>
          }
      />

      {/* Modal chế biến */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 p-4 pt-12 bg-white">
          <Text className="text-2xl font-bold mb-4">Chế biến lô hàng</Text>
          <Text className="mb-4">
            Nguyên liệu:{" "}
            <Text className="font-semibold">{selectedAsset?.productName}</Text>
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Child assets */}
            <Text className="font-bold mb-2 text-lg">Sản phẩm đầu ra</Text>
            {childAssets.map((child) => (
              <View key={child.id} className="mb-3 border p-3 rounded-lg bg-gray-50">
                <Text className="text-xs text-gray-500">Mã sản phẩm con</Text>
                <TextInput
                  value={child.assetID}
                  editable={false}
                  className="border rounded-lg p-2 mb-2 bg-gray-200 text-gray-500"
                />
                <TextInput
                  placeholder="Tên sản phẩm con (vd: Ba chỉ heo khay)"
                  value={child.productName}
                  onChangeText={(text) => setChildAssets(prev => prev.map(c => c.id === child.id ? { ...c, productName: text } : c))}
                  className="border rounded-lg p-2 mb-2"
                />
                <View className="flex-row gap-2">
                    <TextInput
                    placeholder="Số lượng"
                    value={child.quantity.value}
                    keyboardType="numeric"
                    onChangeText={(text) => setChildAssets(prev => prev.map(c => c.id === child.id ? { ...c, quantity: { ...c.quantity, value: text } } : c))}
                    className="border rounded-lg p-2 mb-2 flex-1"
                    />
                    <TextInput
                    placeholder="Đơn vị (vd: khay)"
                    value={child.quantity.unit}
                    onChangeText={(text) => setChildAssets(prev => prev.map(c => c.id === child.id ? { ...c, quantity: { ...c.quantity, unit: text } } : c))}
                    className="border rounded-lg p-2 mb-2 flex-1"
                    />
                </View>
                {childAssets.length > 1 && (
                    <TouchableOpacity onPress={() => handleDeleteChild(child.id)} className="absolute top-2 right-2 p-1">
                        <MaterialCommunityIcons name="close-circle" size={22} color="red" />
                    </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={handleAddChildAsset} className="bg-green-500 px-4 py-2 rounded-lg self-start mb-4">
              <Text className="text-white">+ Thêm sản phẩm</Text>
            </TouchableOpacity>

            {/* Steps */}
            <Text className="font-bold mb-2 text-lg">Các bước chế biến</Text>
            {steps.map((step) => (
              <View key={step.id} className="mb-3 border p-3 rounded-lg bg-gray-50">
                <TextInput
                  placeholder="Tên bước (vd: Sơ chế, Đóng gói)"
                  value={step.name}
                  onChangeText={(text) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, name: text } : s))}
                  className="border rounded-lg p-2 mb-2"
                />
                <TextInput
                  placeholder="Thời gian (ISO)"
                  value={step.timestamp}
                  onChangeText={(text) => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, timestamp: text } : s))}
                  className="border rounded-lg p-2"
                />
                {steps.length > 1 && (
                    <TouchableOpacity onPress={() => handleDeleteStep(step.id)} className="absolute top-2 right-2 p-1">
                        <MaterialCommunityIcons name="close-circle" size={22} color="red" />
                    </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={handleAddStep} className="bg-blue-500 px-4 py-2 rounded-lg self-start mb-6">
              <Text className="text-white">+ Thêm bước</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Buttons */}
          <View className="flex-row justify-end mt-4 gap-3">
            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-gray-200 px-5 py-3 rounded-lg">
              <Text>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmitProcess} className="bg-primary px-5 py-3 rounded-lg">
              <Text className="text-white font-semibold">Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}