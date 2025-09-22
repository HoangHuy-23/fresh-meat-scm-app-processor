// src/components/traceability/DetailRow.tsx

import { DetailValue, ProcessingStep, QuantityValue } from '@/src/types/traceability';
import React from 'react';
import { Text, View } from 'react-native';

interface DetailRowProps {
  label: string;
  value: DetailValue;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  if (value === null || value === undefined || value === '') return null;

  let displayValue: string = '';

  if (Array.isArray(value)) {
    if ((value as ProcessingStep[])[0]?.name !== undefined) {
      displayValue = (value as ProcessingStep[]).map((step) => step.name).join(', ');
    } else {
      displayValue = value.join(', ');
    }
  } else if (typeof value === 'object') {
    const quantity = value as QuantityValue;
    if (quantity.unit && quantity.value) {
      displayValue = `${quantity.value} ${quantity.unit}`;
    } else {
      displayValue = JSON.stringify(value);
    }
  } else {
    displayValue = String(value);
  }

  return (
    <View className="flex-row mb-2">
      <Text className="w-2/5 text-gray-500">{label}</Text>
      <Text className="w-3/5 font-semibold text-gray-800">{displayValue}</Text>
    </View>
  );
};

export default DetailRow;
