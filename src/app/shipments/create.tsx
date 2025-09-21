// src/app/shipments/create.tsx
// THÊM MỚI: import useEffect
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
// THÊM MỚI: import useLocalSearchParams
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/store";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { shipmentApi } from "@/src/api/shipmentApi";
import { fetchProcessedAssets } from "@/src/hooks/useAssets";

// Interface for a single item in the dispatch request
interface Item {
  assetID: string;
  quantity: {
    unit: string;
    value: number;
  };
}

export default function CreateShipment() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { processed, error, status } = useSelector(
    (state: RootState) => state.assets
  );
  
  // THÊM MỚI: Lấy assetID từ URL params
  const { assetID } = useLocalSearchParams<{ assetID?: string }>();

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchProcessedAssets());
    }, [dispatch])
  );

  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [quantity, setQuantity] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // THÊM MỚI: useEffect để tự động chọn item được truyền vào
  useEffect(() => {
    // Kiểm tra xem assetID có tồn tại từ URL không
    // và danh sách sản phẩm đã được tải thành công chưa
    if (assetID && status === "succeeded") {
      // Kiểm tra xem sản phẩm có trong danh sách không
      const itemExists = processed.some(item => item.assetID === assetID);
      if (itemExists) {
        setSelectedBatchId(assetID);
      }
    }
  }, [assetID, processed, status]); // Chạy lại effect khi các giá trị này thay đổi

  const handleSelectBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setQuantity(""); // Reset quantity when selecting a new batch
  };

  const handleAddItem = () => {
    // 1. Validation checks
    if (!selectedBatchId || !quantity) {
      Alert.alert("Thiếu thông tin", "Vui lòng chọn lô hàng và nhập số lượng.");
      return;
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert("Số lượng không hợp lệ", "Số lượng phải là một số lớn hơn 0.");
      return;
    }

    // 2. Prevent adding duplicates
    const isAlreadyAdded = selectedItems.some(
      (item) => item.assetID === selectedBatchId
    );
    if (isAlreadyAdded) {
      Alert.alert("Lỗi", "Lô hàng này đã được thêm vào danh sách.");
      return;
    }

    // 3. Validate against available stock
    const batch = processed.find((b) => b.assetID === selectedBatchId);
    if (!batch) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin lô hàng.");
      return;
    }
    const availableQuantity = batch.currentQuantity.value;
    if (parsedQuantity > availableQuantity) {
      Alert.alert(
        "Vượt quá số lượng",
        `Số lượng xuất (${parsedQuantity}) không được vượt quá số lượng tồn kho (${availableQuantity}).`
      );
      return;
    }

    // Add item to the list
    const newItem: Item = {
      assetID: selectedBatchId,
      quantity: {
        unit: batch.currentQuantity.unit || "con",
        value: parsedQuantity,
      },
    };

    setSelectedItems([...selectedItems, newItem]);
    // Reset inputs after adding
    setSelectedBatchId(null);
    setQuantity("");
  };

  const handleRemoveItem = (assetIDToRemove: string) => {
    setSelectedItems(
      selectedItems.filter((item) => item.assetID !== assetIDToRemove)
    );
  };

  const handleCreate = async () => {
    if (selectedItems.length === 0) {
      Alert.alert("Chưa có hàng", "Vui lòng thêm ít nhất một lô hàng để tạo yêu cầu.");
      return;
    }

    try {
      const response = await shipmentApi.createDispatchRequest({
        items: selectedItems,
      });
      if (response) {
        Alert.alert("Thành công", "Yêu cầu xuất lô đã được tạo thành công.", [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/shipments"),
          },
        ]);
      }
    } catch (error: any) {
      console.error("API call error:", error);
      Alert.alert("Lỗi", `Đã xảy ra lỗi: ${error.message}`);
    }
  };

  // Create a Set of added asset IDs for efficient lookup
  const addedAssetIDs = new Set(selectedItems.map((item) => item.assetID));

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <View className="px-4 pt-10 pb-2 bg-primary shadow-md justify-start flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-2">
          <MaterialCommunityIcons name="arrow-left" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">Tạo yêu cầu xuất lô</Text>
      </View>
      <ScrollView
        className="flex-1 bg-white p-4"
        keyboardShouldPersistTaps="handled"
      >
        {/* Batch Selection */}
        <Text className="mb-2 font-semibold">Chọn lô hàng</Text>
        {processed.map((b) => {
          const isAdded = addedAssetIDs.has(b.assetID);
          return (
            <TouchableOpacity
              key={b.assetID}
              onPress={() => handleSelectBatch(b.assetID)}
              disabled={isAdded}
              className={`p-3 mb-2 rounded-xl border ${
                isAdded
                  ? "bg-gray-200 border-gray-300"
                  : selectedBatchId === b.assetID
                  ? "border-primary bg-primary/10"
                  : "border-gray-300"
              }`}
            >
              <Text className={isAdded ? "text-gray-400" : "text-gray-800"}>
                {b.productName} - Tồn kho: {b.currentQuantity.value} {b.currentQuantity.unit}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Quantity Input and Add Button */}
        {selectedBatchId && (
          <>
            <Text className="mb-2 font-semibold mt-4">Nhập số lượng</Text>
            <View className="flex-row items-center space-x-2">
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
                placeholder={`Tối đa: ${
                  processed.find((b) => b.assetID === selectedBatchId)?.currentQuantity
                    .value
                }`}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
              <TouchableOpacity
                onPress={handleAddItem}
                className="bg-green-500 rounded-lg px-4 py-3"
              >
                <Text className="text-white font-semibold">Thêm</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Selected Items List */}
        {selectedItems.length > 0 && (
          <View className="mt-6">
            <Text className="mb-2 font-semibold text-base">
              Các lô hàng đã chọn
            </Text>
            {selectedItems.map((item) => (
              <View
                key={item.assetID}
                className="flex-row items-center justify-between bg-gray-100 p-3 rounded-lg mb-2"
              >
                <View>
                  <Text className="font-bold text-gray-800">
                    {
                      processed.find((b) => b.assetID === item.assetID)
                        ?.productName
                    }
                  </Text>
                  <Text className="text-gray-600">
                    Số lượng: {item.quantity.value} {item.quantity.unit}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveItem(item.assetID)}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={24}
                    color="#ef4444"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity
          onPress={handleCreate}
          className="bg-primary rounded-2xl py-3 mt-6"
        >
          <Text className="text-center text-white font-semibold text-lg">
            Gửi yêu cầu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-3 border border-gray-300 rounded-2xl py-3 mb-8"
        >
          <Text className="text-center text-gray-700">Hủy</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}