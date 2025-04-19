import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { styled } from 'nativewind';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import VoiceRecorder from '../components/VoiceRecorder';
import ResponseBubble from '../components/ResponseBubble';
import SchemeCard from '../components/SchemeCard';
import * as api from '../services/api';
import icon from '../assets/icon.png';

const { width } = Dimensions.get('window');

// Define our theme colors based on #4b6abd
const primaryColor = '#4b6abd';
const primaryLight = '#829bda'; // Light tint
const primaryDark = '#304a7d';   // Dark shade
const primaryExtraLight = '#c0d3f2'; // Very light tint

const HomeScreen = () => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [expandedSchemeId, setExpandedSchemeId] = useState(null);
  const [sound, setSound] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const welcomeAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef();

  // Clean up sound on unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start floating animation for welcome container
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Animate welcome container
    if (hasInteracted) {
      Animated.timing(welcomeAnim, {
        toValue: 0.6,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [hasInteracted]);

  const handleRecordingComplete = async (recordingData) => {
    try {
      setIsLoading(true);
      setResponse('');
      setSchemes([]);
      setHasInteracted(true);

      // Send the audio file to the backend for processing
      const result = await api.processAudio(recordingData);

      // Set the response text
      setResponse(result.response);

      // Set the matched schemes
      if (result.schemes && result.schemes.length > 0) {
        setSchemes(result.schemes);
      }

      // Store the audio URL for later use and set loading to false
      if (result.audio_url) {
        setAudioUrl(result.audio_url);
      }

      setIsLoading(false);

      // Scroll to response
      if (scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current.scrollTo({ y: 120, animated: true });
        }, 100);
      }

      // Play the audio response
      if (result.audio_url) {
        await playResponseAudio(result.audio_url);
      }

    } catch (error) {
      console.error('Error processing recording:', error);
      setIsLoading(false);
      setResponse('Sorry, there was an error processing your request. Please try again.');
    }
  };

  const playResponseAudio = async (audioUrl) => {
    // Play the TTS audio from the backend
    try {
      setIsPlaying(true);

      // Download and play the audio file
      if (sound) {
        await sound.unloadAsync();
      }

      // If we have a full URL, use it directly, otherwise prepend the API base URL
      const fullAudioUrl = audioUrl.startsWith('http')
        ? audioUrl
        : `${api.API_BASE_URL}${audioUrl}`;

      // Download and play the audio
      const audioUri = await api.downloadAudioResponse(fullAudioUrl);

      // Create a new sound object
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      // Set the sound object and add an event listener for when playback finishes
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const toggleSchemeExpand = (id) => {
    setExpandedSchemeId(expandedSchemeId === id ? null : id);
  };

  return (
    <SafeAreaView className="flex-1 bg-white"> {/* White Background */}
      <StatusBar style="light" />

      <View
        className="flex-row items-center justify-between px-6 py-5 shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <View className="flex-row items-center space-x-3 pt-6">
          <Image
            source={icon}
            className="w-12 h-12 m-2 rounded-md"
            style={{ tintColor: 'white' }}
            resizeMode="contain"
          />
          <View>
            <Text className="text-3xl font-bold text-white">Maitri AI</Text>
            <Text className="text-yellow-200 text-lg">Your Scheme Assistant</Text> {/* Keeping a touch of warmth */}
          </View>
        </View>
        <TouchableOpacity className="bg-white/20 rounded-full p-3">
          <Ionicons name="help-circle-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          className="p-6 items-center"
          style={{
            opacity: welcomeAnim,
            transform: [
              { translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8]
              }) }
            ]
          }}
        >
          <View className="bg-white rounded-3xl w-full p-8 items-center shadow-lg border" style={{ borderColor: primaryLight }}> {/* Light Blue-Purple Border */}
            <View className="bg-white rounded-full p-5 mb-5" style={{ backgroundColor: primaryExtraLight }}> {/* Very Light Blue-Purple Icon Background */}
              <FontAwesome name="comments" size={38} color={primaryDark} /> {/* Dark Blue-Purple Icon */}
            </View>
            <Text className="text-3xl font-bold text-gray-800 text-center leading-tight">नमस्ते! मैं आपकी सहायता के लिए हूँ</Text>
            <Text className="text-lg text-gray-700 mt-4 text-center">मुझसे सरकारी योजनाओं के बारे में पूछें</Text>

            <View className="flex-row items-center bg-white py-4 px-6 rounded-full mt-6 border" style={{ borderColor: primaryLight }}> {/* Light Blue-Purple Border */}
              <View className="bg-white rounded-full p-3 mr-4" style={{ backgroundColor: primaryLight }}> {/* Light Blue-Purple Microphone Background */}
                <FontAwesome name="microphone" size={22} color={primaryDark} /> {/* Dark Blue-Purple Microphone Icon */}
              </View>
              <Text className="text-lg text-gray-700 font-medium">बात करने के लिए माइक बटन पर क्लिक करें</Text>
            </View>
          </View>
        </Animated.View>

        {(response || isLoading) && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <ResponseBubble
              message={response}
              isLoading={isLoading}
              isPlaying={isPlaying}
              onPlayAudio={() => {
                if (audioUrl) {
                  playResponseAudio(audioUrl);
                }
              }}
            />
          </Animated.View>
        )}

        {schemes.length > 0 && (
          <Animated.View
            className="p-5"
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            <View className="flex-row items-center mb-4">
              <FontAwesome name="star" size={20} color={primaryDark} className="mr-2" /> {/* Dark Blue-Purple Star */}
              <Text className="text-xl font-bold text-gray-800">आपके लिए योजनाएँ:</Text>
            </View>

            {schemes.map((scheme, index) => (
              <Animated.View
                key={scheme.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: Animated.multiply(
                      slideAnim,
                      new Animated.Value((index + 1) * 0.3)
                    )
                  }]
                }}
              >
                <SchemeCard
                  scheme={scheme}
                  expanded={expandedSchemeId === scheme.id}
                  onToggleExpand={() => toggleSchemeExpand(scheme.id)}
                />
              </Animated.View>
            ))}
          </Animated.View>
        )}

        <View className="h-24" />
      </ScrollView>

      <Animated.View
        className="absolute bottom-0 left-0 right-0"
        style={{
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [120, 0]
          })}]
        }}
      >
        <View
          className="pt-5 pb-7 rounded-t-[30px] shadow-xl"
          style={{ backgroundColor: primaryExtraLight }}
        >
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default HomeScreen;