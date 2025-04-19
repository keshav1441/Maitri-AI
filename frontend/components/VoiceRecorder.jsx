import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { FontAwesome } from '@expo/vector-icons';

const VoiceRecorder = ({ onRecordingComplete }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    return () => {
      if (recording) {
        stopRecording();
      }
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access microphone is required!');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Start recording
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);

      // Start timer
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      // Stop timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      setIsRecording(false);
      setIsProcessing(true);

      // Get URI before stopping the recording
      const uri = recording.getURI();
      
      try {
        // Stop recording
        await recording.stopAndUnloadAsync();
      } catch (error) {
        console.log('Recording may already be unloaded:', error);
      }
      
      setRecording(null);
      setRecordingDuration(0);

      // Process the recording if we have a valid URI
      if (uri && onRecordingComplete) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (fileInfo.exists) {
            onRecordingComplete({
              uri,
              size: fileInfo.size,
              duration: recordingDuration,
            });
          } else {
            throw new Error('Recording file not found');
          }
        } catch (error) {
          console.error('Error processing recording file:', error);
          alert('Failed to process recording. Please try again.');
        }
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('Failed to stop recording', error);
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="items-center justify-center p-5">
      {isProcessing ? (
        <View className="items-center justify-center">
          <ActivityIndicator size="large" color="#6A0DAD" />
          <Text className="mt-2.5 text-purple-700 text-base">Processing audio...</Text>
        </View>
      ) : (
        <>
          <Text className="text-lg mb-5 text-gray-700 font-medium">
            {isRecording ? formatTime(recordingDuration) : 'Press to speak'}
          </Text>
          <TouchableOpacity
            className={`items-center justify-center shadow-lg ${isRecording ? 'w-[90px] h-[90px] rounded-[45px] bg-red-500' : 'w-20 h-20 rounded-[40px] bg-purple-700'}`}
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={isRecording ? 'stop-circle' : 'microphone'}
              size={isRecording ? 40 : 36}
              color="white"
            />
          </TouchableOpacity>
          {isRecording && (
            <Text className="mt-4 text-gray-600 text-sm">Tap to stop recording</Text>
          )}
        </>
      )}
    </View>
  );
};

export default VoiceRecorder;