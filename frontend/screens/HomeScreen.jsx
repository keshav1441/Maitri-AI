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
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import VoiceRecorder from '../components/VoiceRecorder';
import ResponseBubble from '../components/ResponseBubble';
import SchemeCard from '../components/SchemeCard';
import * as api from '../services/api';
import icon from '../assets/icon.png';

const { width } = Dimensions.get('window');

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#6A0DAD', '#8A2BE2']}
        className="flex-row items-center justify-between px-6 py-5 rounded-b-[25px] shadow-lg"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View className="flex-row items-center space-x-3 pt-6">
          <Image 
            source={icon} 
            className="w-10 h-10 m-2"
            style={{ tintColor: '#fff' }}
            resizeMode="contain"
          />
          <View>
            <Text className="text-2xl font-bold text-white">Maitri AI</Text>
            <Text className="text-purple-200 text-sm">Your Scheme Assistant</Text>
          </View>
        </View>
        <TouchableOpacity className="bg-white/20 rounded-full p-2.5">
          <Ionicons name="help-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>
      
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          className="p-5 items-center"
          style={{
            opacity: welcomeAnim,
            transform: [
              { translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10]
              })}
            ]
          }}
        >
          <View className="bg-white rounded-3xl w-full p-6 items-center shadow-lg border border-purple-100">
            <View className="bg-purple-50 rounded-full p-4 mb-4">
              <FontAwesome name="comments" size={32} color="#6A0DAD" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 text-center leading-tight">नमस्ते! मैं आपकी सहायता के लिए हूँ</Text>
            <Text className="text-base text-gray-600 mt-3 text-center">मुझसे सरकारी योजनाओं के बारे में पूछें</Text>
            
            <View className="flex-row items-center bg-purple-50 py-3 px-5 rounded-full mt-5 border border-purple-100">
              <View className="bg-purple-100 rounded-full p-2 mr-3">
                <FontAwesome name="microphone" size={18} color="#6A0DAD" />
              </View>
              <Text className="text-sm text-gray-700 font-medium">बात करने के लिए माइक बटन पर क्लिक करें</Text>
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
            className="p-4"
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            <View className="flex-row items-center mb-3">
              <FontAwesome name="star" size={18} color="#6A0DAD" className="mr-1.5" />
              <Text className="text-lg font-bold text-gray-800">आपके लिए योजनाएँ:</Text>
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
        
        <View className="h-20" />
      </ScrollView>
      
      <Animated.View 
        className="absolute bottom-0 left-0 right-0"
        style={{
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 0]
          })}]
        }}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.8)', '#ffffff']}
          className="pt-4 pb-6 rounded-t-[20px] shadow-lg"
        >
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
};

export default HomeScreen;