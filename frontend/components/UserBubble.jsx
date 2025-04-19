import React from 'react';
import { View, Text, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const UserBubble = ({ message }) => {
  if (!message) return null;

  return (
    <View className="flex-row my-3 px-4">
      <View className="items-center mr-3">
        <View className="w-12 h-12 rounded-full bg-blue-100 justify-center items-center shadow-md">
          <View className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-blue-700 to-blue-500 justify-center items-center shadow-inner">
            <FontAwesome name="user" size={20} color="white" />
          </View>
        </View>
        <Text className="text-xs text-gray-700 mt-2 font-semibold">You</Text>
      </View>
      
      <View className="flex-1">
        <View className="max-w-full">
          <View className="bg-gradient-to-br from-blue-50 to-white rounded-[24px] rounded-tl-sm p-5 shadow-md border border-blue-100">
            <Text className="text-base text-gray-800 leading-7 tracking-wide font-[450]">{message}</Text>
          </View>
          <View className="self-end mt-1 mr-1">
            <Text className="text-[10px] text-gray-500 italic">just now</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default UserBubble;