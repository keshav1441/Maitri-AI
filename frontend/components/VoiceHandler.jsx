import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';

const VoiceHandler = ({ onTranscriptionComplete, onPlaybackComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingTTS, setLoadingTTS] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const transcriptAnim = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (sound) sound.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      waveAnim.setValue(0);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (loadingTTS) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [loadingTTS]);

  const onSpeechStart = () => setIsListening(true);
  const onSpeechEnd = () => setIsListening(false);
  const onSpeechResults = (event) => {
    const text = event.value[0];
    setTranscript(text);
    Animated.spring(transcriptAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
    onTranscriptionComplete?.(text);
  };
  const onSpeechError = (e) => {
    console.error('Speech error:', e);
    setIsListening(false);
  };

  const startListening = async () => {
    if (transcript) {
      setTranscript('');
      transcriptAnim.setValue(0);
    }
    try {
      await Voice.start('en-US');
    } catch (e) {
      console.error('Start error:', e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Stop error:', e);
    }
  };

  const playTTS = async (text) => {
    try {
      setLoadingTTS(true);
      setIsPlaying(true);

      const response = await fetch('http://localhost:8000/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: text,
      });

      if (!response.ok) throw new Error('TTS Failed');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { progressUpdateIntervalMillis: 100 },
        handlePlaybackStatusUpdate
      );

      setSound(newSound);
      await newSound.playAsync();
      URL.revokeObjectURL(audioUrl);
    } catch (e) {
      console.error('TTS error:', e);
      setIsPlaying(false);
    } finally {
      setLoadingTTS(false);
    }
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      onPlaybackComplete?.();
    }
  };

  const renderWaveBars = () => {
    const bars = [];
    const barCount = 5;
    for (let i = 0; i < barCount; i++) {
      const scaleValue = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1 - (Math.abs(i - barCount / 2) / (barCount / 2)) * 0.6],
      });

      bars.push(
        <Animated.View
          key={i}
          className="w-1 mx-0.5 rounded-sm bg-white"
          style={{ transform: [{ scaleY: scaleValue }] }}
        />
      );
    }
    return bars;
  };

  return (
    <View className="items-center justify-center px-6">
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          className={`flex-col items-center px-6 py-4 rounded-full mt-4 shadow-md ${isListening ? 'bg-red-600' : 'bg-indigo-600'}`}
          onPress={isListening ? stopListening : startListening}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <FontAwesome
              name={isListening ? 'stop-circle' : 'microphone'}
              size={24}
              color="white"
            />
            <Text className="text-white ml-2 text-base font-semibold">
              {isListening ? 'Stop' : 'Start'} Listening
            </Text>
          </View>

          {isListening && (
            <View className="flex-row justify-center mt-2">
              <View className="w-2 h-2 rounded-full bg-white/80 mx-0.5" />
              <View className="w-2 h-2 rounded-full bg-white/60 mx-0.5" />
              <View className="w-2 h-2 rounded-full bg-white/40 mx-0.5" />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {transcript && (
        <Animated.View
          className="mt-6 items-center"
          style={{
            opacity: transcriptAnim,
            transform: [{
              translateY: transcriptAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })
            }],
          }}
        >
          <View className="bg-gray-100 rounded-lg p-4">
            <Text className="text-gray-800 text-base">{transcript}</Text>
          </View>

          <TouchableOpacity
            className={`mt-3 p-3 rounded-full ${isPlaying || loadingTTS ? 'bg-gray-400' : 'bg-green-600'}`}
            onPress={() => playTTS(transcript)}
            disabled={isPlaying || loadingTTS}
            activeOpacity={0.7}
          >
            {loadingTTS ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <FontAwesome name="spinner" size={20} color="white" />
              </Animated.View>
            ) : isPlaying ? (
              <View className="flex-row items-end h-6">{renderWaveBars()}</View>
            ) : (
              <FontAwesome name="play" size={20} color="white" />
            )}
          </TouchableOpacity>
        </Animated.View>
      )}

      {isListening && (
        <View className="mt-2">
          <Text className="text-indigo-600 font-medium">Listening...</Text>
        </View>
      )}
    </View>
  );
};

export default VoiceHandler;
