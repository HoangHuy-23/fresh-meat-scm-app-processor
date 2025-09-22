// src/components/traceability/TraceabilityHeader.tsx
import { TraceabilityData } from '@/src/types/traceability';
import React from 'react';
import { Text, View } from 'react-native';

interface TraceabilityHeaderProps {
  data: Pick<TraceabilityData, 'productName' | 'assetID' | 'status'>;
}

const TraceabilityHeader: React.FC<TraceabilityHeaderProps> = ({ data }) => {
  return (
    <View className="mb-6 bg-white p-4 rounded-lg shadow-sm">
      <Text className="text-2xl font-bold text-gray-900">{data.productName}</Text>
      <Text className="text-sm text-gray-500 mt-1">Mã sản phẩm: {data.assetID}</Text>
      <View className="self-start mt-3 px-3 py-1 bg-green-100 rounded-full">
        <Text className="font-semibold text-green-800">
          {data.status === 'SOLD' ? 'Đã bán' : 'Còn hàng'}
        </Text>
      </View>
    </View>
  );
};

export default TraceabilityHeader;
