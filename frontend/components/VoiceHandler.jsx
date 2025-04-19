import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';

const VoiceHandler = ({ onTranscriptionComplete, onPlaybackComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingTTS, setLoadingTTS] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const transcriptAnim = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Create a rotating animation for the loading indicator
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    // Initialize Voice
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      // Cleanup
      Voice.destroy().then(Voice.removeAllListeners);
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Pulsing animation for the mic button when active
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

  // Sound wave animation for the play button
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

  // Loading spinner animation
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

  const onSpeechStart = () => {
    console.log('Speech started');
    setIsListening(true);
  };

  const onSpeechEnd = () => {
    console.log('Speech ended');
    setIsListening(false);
  };

  const onSpeechResults = (event) => {
    const text = event.value[0];
    setTranscript(text);
    
    // Animate transcript appearance
    Animated.spring(transcriptAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    if (onTranscriptionComplete) {
      onTranscriptionComplete(text);
    }
  };

  const onSpeechError = (error) => {
    console.error('Speech recognition error:', error);
    setIsListening(false);
  };

  const startListening = async () => {
    try {
      // Reset transcript animation if we're starting again
      if (transcript) {
        setTranscript('');
        transcriptAnim.setValue(0);
      }
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const playTTS = async (text) => {
    try {
      setLoadingTTS(true);
      setIsPlaying(true);
      
      const response = await fetch('http://localhost:8000/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: text,
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { progressUpdateIntervalMillis: 100 },
        handlePlaybackStatusUpdate
      );
      
      setLoadingTTS(false);
      setSound(newSound);
      await newSound.playAsync();

      // Clean up the URL after playing
      URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.error('Error playing TTS:', error);
      setLoadingTTS(false);
      setIsPlaying(false);
    }
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      setIsPlaying(false);
      if (onPlaybackComplete) {
        onPlaybackComplete();
      }
    }
  };

  // Generate the wave bars for the audio visualizer
  const renderWaveBars = () => {
    const bars = [];
    const barCount = 5;
    
    for (let i = 0; i < barCount; i++) {
      const scaleValue = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1 - (Math.abs(i - barCount/2) / (barCount/2)) * 0.6],
      });
      
      bars.push(
        <Animated.View 
          key={i} 
          style={[
            styles.waveBar,
            { transform: [{ scaleY: scaleValue }] }
          ]} 
        />
      );
    }
    
    return bars;
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.micButtonWrapper,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <TouchableOpacity
          style={[styles.button, isListening && styles.buttonActive]}
          onPress={isListening ? stopListening : startListening}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <FontAwesome
              name={isListening ? 'stop-circle' : 'microphone'}
              size={24}
              color="white"
            />
            <Text style={styles.buttonText}>
              {isListening ? 'Stop' : 'Start'} Listening
            </Text>
          </View>
          
          {isListening && (
            <View style={styles.listeningIndicator}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.delayedDot1]} />
              <View style={[styles.dot, styles.delayedDot2]} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
      
      {transcript ? (
        <Animated.View 
          style={[
            styles.transcriptContainer,
            { 
              opacity: transcriptAnim,
              transform: [
                { translateY: transcriptAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}
              ]
            }
          ]}
        >
          <View style={styles.transcriptBubble}>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.playButton, (isPlaying || loadingTTS) && styles.playButtonActive]}
            onPress={() => playTTS(transcript)}
            disabled={isPlaying || loadingTTS}
            activeOpacity={0.7}
          >
            {loadingTTS ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <FontAwesome name="spinner" size={20} color="white" />
              </Animated.View>
            ) : isPlaying ? (
              <View style={styles.waveContainer}>
                {renderWaveBars()}
              </View>
            ) : (
              <FontAwesome name="play" size={20} color="white" />
            )}
          </TouchableOpacity>
        </Animated.View>
      ) : null}
      
      {isListening && (
        <View style={styles.listeningIndicatorText}>
          <Text style={styles.listeningText}>Listening...</Text>
        </View>
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
  micButtonWrapper: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#6A5ACD', // Slateblue
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginVertical: 10,
  },
  buttonActive: {
    backgroundColor: '#FF4500', // OrangeRed
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  listeningIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 2,
    opacity: 0.8,
    // Using animation keyframes via opacity in React Native requires Animated API
    // Here we just show static dots with different opacities
  },
  delayedDot1: {
    opacity: 0.6,
  },
  delayedDot2: {
    opacity: 0.4,
  },
  listeningIndicatorText: {
    marginTop: 8,
  },
  listeningText: {
    color: '#FF4500', // OrangeRed
    fontSize: 14,
    fontStyle: 'italic',
  },
  transcriptContainer: {
    width: '90%',
    marginTop: 24,
    alignItems: 'center',
  },
  transcriptBubble: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  playButton: {
    backgroundColor: '#6A5ACD', // Slateblue
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  playButtonActive: {
    backgroundColor: '#32CD32', // LimeGreen
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  waveBar: {
    width: 3,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
});

export default VoiceHandler;