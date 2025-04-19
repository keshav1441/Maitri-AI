import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { styled } from 'nativewind';
import { FontAwesome } from '@expo/vector-icons';

const ResponseBubble = ({ message, isLoading, isPlaying, onPlayAudio }) => {
  // Animation for the bubble appearance
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  
  // Animated dots for the loading state
  const loadingDot1 = React.useRef(new Animated.Value(0)).current;
  const loadingDot2 = React.useRef(new Animated.Value(0)).current;
  const loadingDot3 = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Bubble entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Loading dots animation
    if (isLoading) {
      const animateDots = () => {
        Animated.stagger(150, [
          Animated.sequence([
            Animated.timing(loadingDot1, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(loadingDot1, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(loadingDot2, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(loadingDot2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(loadingDot3, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(loadingDot3, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          if (isLoading) animateDots();
        });
      };
      
      animateDots();
    }
  }, [fadeAnim, scaleAnim, isLoading, loadingDot1, loadingDot2, loadingDot3]);

  // Sound wave animation for playing state
  const soundWave1 = React.useRef(new Animated.Value(1)).current;
  const soundWave2 = React.useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(soundWave1, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(soundWave2, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(soundWave1, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(soundWave2, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      soundWave1.setValue(1);
      soundWave2.setValue(0.3);
    }
  }, [isPlaying, soundWave1, soundWave2]);

  return (
    <View className="flex-row my-3 px-4">
      <View className="items-center mr-3">
        <View className="w-12 h-12 rounded-full bg-purple-100 justify-center items-center shadow-md">
          <View className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-purple-700 to-purple-500 justify-center items-center shadow-inner">
            <Text className="text-white text-lg font-bold">M</Text>
          </View>
        </View>
        <Text className="text-xs text-gray-700 mt-2 font-semibold">Maitri</Text>
      </View>
      
      <Animated.View 
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}
      >
        <View className="max-w-full">
          <View className="bg-gradient-to-br from-purple-50 to-white rounded-[24px] rounded-tl-sm p-5 shadow-md border border-purple-100">
            {isLoading ? (
              <View className="items-center justify-center p-2 flex-col">
                <View className="flex-row justify-center items-center mb-2.5">
                  <Animated.View className="w-2 h-2 rounded-full bg-purple-700 mx-0.5" style={{ opacity: loadingDot1 }} />
                  <Animated.View className="w-2 h-2 rounded-full bg-purple-700 mx-0.5" style={{ opacity: loadingDot2 }} />
                  <Animated.View className="w-2 h-2 rounded-full bg-purple-700 mx-0.5" style={{ opacity: loadingDot3 }} />
                </View>
                <Text className="text-purple-700 text-sm font-semibold opacity-90">Thinking...</Text>
              </View>
            ) : (
              <>
                <Text className="text-base text-gray-800 leading-7 tracking-wide font-[450]">{message}</Text>
                {message && (
                  <TouchableOpacity 
                    className="mt-3 self-end"
                    onPress={onPlayAudio}
                    activeOpacity={0.7}
                  >
                    <View className="bg-purple-100 rounded-2xl p-2.5 w-10 h-10 justify-center items-center shadow-sm border border-purple-200">
                      {isPlaying ? (
                        <View className="flex-row items-center justify-center h-4">
                          <Animated.View className="w-[3px] h-3.5 bg-purple-700 rounded-[1.5px] mx-0.5" style={{ transform: [{ scaleY: soundWave1 }] }} />
                          <Animated.View className="w-[3px] h-3.5 bg-purple-700 rounded-[1.5px] mx-0.5" style={{ transform: [{ scaleY: soundWave2 }] }} />
                          <Animated.View className="w-[3px] h-3.5 bg-purple-700 rounded-[1.5px] mx-0.5" style={{ transform: [{ scaleY: soundWave1 }] }} />
                        </View>
                      ) : (
                        <FontAwesome name="volume-up" size={16} color="#6A0DAD" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
          <View className="self-end mt-1 mr-1">
            <Text className="text-[10px] text-gray-500 italic">just now</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default ResponseBubble;