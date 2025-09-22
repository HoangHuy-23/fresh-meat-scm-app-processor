// src/components/traceability/HistoryStep.tsx

import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, Pressable, Text, TouchableOpacity, View } from 'react-native';
import DetailRow from './DetailRow';
import { TraceabilityEvent } from '@/src/types/traceability';
import { DETAIL_LABELS, EVENT_TITLES } from '@/src/constants/tracebilityConstant';
import { formatTimestamp } from '@/src/hellpers/formatter';

interface HistoryStepProps {
  event: TraceabilityEvent;
  isLast: boolean;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  FARMING: <MaterialCommunityIcons name="barn" size={24} color="white" />,
  PROCESSING: <MaterialCommunityIcons name="factory" size={24} color="white" />,
  SHIPPING_STARTED: <MaterialCommunityIcons name="truck-delivery" size={24} color="white" />,
  RECEIVING: <MaterialCommunityIcons name="store-check" size={24} color="white" />,
  STORAGE_UPDATE: <MaterialCommunityIcons name="snowflake" size={24} color="white" />,
  SOLD: <Ionicons name="cart" size={24} color="white" />,
  DEFAULT: <Feather name="box" size={24} color="white" />,
};

const HistoryStep: React.FC<HistoryStepProps> = ({ event, isLast }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const title = EVENT_TITLES[event.type] || event.type;
  const icon = EVENT_ICONS[event.type] || EVENT_ICONS.DEFAULT;

  return (
    <View className="flex-row">
      <View className="items-center mr-4">
        <View className="w-12 h-12 bg-primary rounded-full items-center justify-center z-10">
          {icon}
        </View>
        {!isLast && <View className="w-0.5 flex-1 bg-gray-300" />}
      </View>

      <View className="flex-1 pb-8">
        <Pressable
          onPress={() => setIsExpanded((prev) => !prev)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="bg-white p-4 rounded-lg shadow-sm"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800">{title}</Text>
              <Text className="text-sm text-gray-500">{formatTimestamp(event.timestamp)}</Text>
            </View>
            <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={24} color="#6B7280" />
          </View>

          {isExpanded && (
            <View className="mt-4 pt-4 border-t border-gray-200">
              {Object.entries(event.details).map(([key, value]) => (
                <DetailRow key={key} label={DETAIL_LABELS[key] || key} value={value} />
              ))}
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`https://your-blockchain-explorer.com/tx/${event.txID}`)
                }
              >
                <Text className="text-blue-600 text-xs mt-2 underline">Xem giao dịch</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default HistoryStep;
