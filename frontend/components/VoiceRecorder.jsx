import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
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

      // Stop recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordingDuration(0);

      // Process the recording
      if (uri && onRecordingComplete) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        onRecordingComplete({
          uri,
          size: fileInfo.size,
          duration: recordingDuration,
        });
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
    <View style={styles.container}>
      {isProcessing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#6A0DAD" />
          <Text style={styles.processingText}>Processing audio...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.timerText}>
            {isRecording ? formatTime(recordingDuration) : 'Press to speak'}
          </Text>
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingActive]}
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
            <Text style={styles.hintText}>Tap to stop recording</Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6A0DAD',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  recordingActive: {
    backgroundColor: '#FF4136',
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  timerText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
    fontWeight: '500',
  },
  hintText: {
    marginTop: 15,
    color: '#666',
    fontSize: 14,
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    marginTop: 10,
    color: '#6A0DAD',
    fontSize: 16,
  },
});

export default VoiceRecorder;