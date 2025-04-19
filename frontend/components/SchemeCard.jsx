import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const SchemeCard = ({ scheme, expanded, onToggleExpand }) => {
  return (
    <View className="bg-white rounded-2xl my-2.5 px-5 py-5 shadow-md border border-[#F0E6FF] border-l-[5px] border-l-[#6A0DAD]">
      <TouchableOpacity onPress={onToggleExpand} className="flex-row justify-between items-center">
        <View className="flex-1 flex-row justify-between items-center">
          <Text className="text-lg font-bold text-[#1A1A1A] flex-1 tracking-wider">
            {scheme.title}
          </Text>
          <FontAwesome 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={14} 
            color="#6A0DAD" 
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View className="mt-3">
          {/* Eligibility */}
          <View className="mb-3">
            <Text className="text-base font-semibold text-[#6A0DAD] mb-1 tracking-wide">
              Eligibility:
            </Text>
            <Text className="text-sm text-[#4A4A4A] leading-6 tracking-tight">
              {scheme.eligibility}
            </Text>
          </View>

          {/* Documents */}
          <View className="mb-3">
            <Text className="text-base font-semibold text-[#6A0DAD] mb-1 tracking-wide">
              Required Documents:
            </Text>
            {scheme.documents.map((doc, index) => (
              <View key={index} className="flex-row mb-1 pr-2">
                <Text className="w-5 text-sm font-bold text-[#6A0DAD]">•</Text>
                <Text className="flex-1 text-sm text-[#4A4A4A] leading-6 tracking-tight">
                  {doc}
                </Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          <View className="mb-3">
            <Text className="text-base font-semibold text-[#6A0DAD] mb-1 tracking-wide">
              How to Apply:
            </Text>
            {scheme.steps.map((step, index) => (
              <View key={index} className="flex-row mb-1 pr-2">
                <Text className="w-5 text-sm font-bold text-[#6A0DAD]">{index + 1}.</Text>
                <Text className="flex-1 text-sm text-[#4A4A4A] leading-6 tracking-tight">
                  {step}
                </Text>
              </View>
            ))}
          </View>

          {/* Benefits */}
          <View className="mb-3">
            <Text className="text-base font-semibold text-[#6A0DAD] mb-1 tracking-wide">
              Benefits:
            </Text>
            <Text className="text-sm text-[#4A4A4A] leading-6 tracking-tight">
              {scheme.benefits}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SchemeCard;
