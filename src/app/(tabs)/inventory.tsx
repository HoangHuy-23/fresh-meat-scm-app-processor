import ProcessedProducts from "@/src/components/ProcessedProductsView";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import MaterialView from "../../components/MaterialView";

export default function InventoryScreen() {
  const [activeTab, setActiveTab] = useState<"material" | "product">(
    "material"
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-10 pb-3 bg-primary shadow-md flex-row items-center">
        <MaterialCommunityIcons name="warehouse" size={22} color="white" />
        <Text className="text-white font-bold text-xl ml-2">Kho lưu trữ</Text>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row p-2 bg-gray-100">
        <TouchableOpacity
          onPress={() => setActiveTab("material")}
          className={`flex-1 py-2 rounded-lg ${activeTab === "material" ? "bg-primary" : ""}`}
        >
          <Text
            className={`text-center font-semibold ${activeTab === "material" ? "text-white" : "text-gray-600"}`}
          >
            Nguyên liệu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("product")}
          className={`flex-1 py-2 rounded-lg ${activeTab === "product" ? "bg-primary" : ""}`}
        >
          <Text
            className={`text-center font-semibold ${activeTab === "product" ? "text-white" : "text-gray-600"}`}
          >
            Đã chế biến
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung hiển thị theo tab */}
      <View className="flex-1 px-2">
        {activeTab === "material" ? <MaterialView /> : <ProcessedProducts />}
      </View>
    </SafeAreaView>
  );
}
