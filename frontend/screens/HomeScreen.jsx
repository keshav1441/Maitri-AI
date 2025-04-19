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
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import VoiceRecorder from '../components/VoiceRecorder';
import ResponseBubble from '../components/ResponseBubble';
import SchemeCard from '../components/SchemeCard';
import icon from '../assets/icon.png';

const { width } = Dimensions.get('window');
const LOCAL_SERVER = 'http://localhost:8000'; // 👈 Replace with your actual IP

// Define our theme colors based on #4b6abd
const primaryColor = '#4b6abd';
const primaryLight = '#829bda';
const primaryDark = '#304a7d';
const primaryExtraLight = '#c0d3f2';

const HomeScreen = () => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [expandedSchemeId, setExpandedSchemeId] = useState(null);
  const [sound, setSound] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const welcomeAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef();

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  useEffect(() => {
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

      const formData = new FormData();
      formData.append('audio', {
        uri: recordingData.uri,
        name: 'recording.m4a',
        type: 'audio/m4a',
      });

      const response = await fetch(`${LOCAL_SERVER}/process-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const result = await response.json();
      setResponse(result.response);

      if (result.schemes?.length > 0) {
        setSchemes(result.schemes);
      }

      if (result.audio_url) {
        setAudioUrl(result.audio_url);
      }

      setIsLoading(false);

      if (scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current.scrollTo({ y: 120, animated: true });
        }, 100);
      }

      if (result.audio_url) {
        await playResponseAudio(result.audio_url);
      }

    } catch (error) {
      console.error('Error processing recording:', error);
      setIsLoading(false);
      setResponse('Sorry, there was an error processing your request. Please try again.');
    }
  };

  const playResponseAudio = async (urlPath) => {
    try {
      setIsPlaying(true);

      if (sound) await sound.unloadAsync();

      const fullUrl = urlPath.startsWith('http')
        ? urlPath
        : `${LOCAL_SERVER}${urlPath}`;

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { shouldPlay: true }
      );

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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="light" />

      <View className="flex-row items-center justify-between px-6 py-5 shadow-md" style={{ backgroundColor: primaryColor }}>
        <View className="flex-row items-center space-x-3 pt-6">
          <Image source={icon} className="w-12 h-12 m-2 rounded-md" style={{ tintColor: 'white' }} resizeMode="contain" />
          <View>
            <Text className="text-3xl font-bold text-white">Maitri AI</Text>
            <Text className="text-yellow-200 text-lg">Your Scheme Assistant</Text>
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
        <Animated.View className="p-6 items-center" style={{
          opacity: welcomeAnim,
          transform: [{ translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }]
        }}>
          <View className="bg-white rounded-3xl w-full p-8 items-center shadow-lg border" style={{ borderColor: primaryLight }}>
            <View className="bg-white rounded-full p-5 mb-5" style={{ backgroundColor: primaryExtraLight }}>
              <FontAwesome name="comments" size={38} color={primaryDark} />
            </View>
            <Text className="text-3xl font-bold text-gray-800 text-center leading-tight">नमस्ते! मैं आपकी सहायता के लिए हूँ</Text>
            <Text className="text-lg text-gray-700 mt-4 text-center">मुझसे सरकारी योजनाओं के बारे में पूछें</Text>

            <View className="flex-row items-center bg-white py-4 px-6 rounded-full mt-6 border" style={{ borderColor: primaryLight }}>
              <View className="bg-white rounded-full p-3 mr-4" style={{ backgroundColor: primaryLight }}>
                <FontAwesome name="microphone" size={22} color={primaryDark} />
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
          <Animated.View className="p-5" style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <View className="flex-row items-center mb-4">
              <FontAwesome name="star" size={20} color={primaryDark} />
              <Text className="text-xl font-bold text-gray-800 ml-2">आपके लिए योजनाएँ:</Text>
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

      <Animated.View className="absolute bottom-0 left-0 right-0" style={{
        transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [120, 0] }) }]
      }}>
        <View className="pt-5 pb-7 rounded-t-[30px] shadow-xl" style={{ backgroundColor: primaryExtraLight }}>
          <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default HomeScreen;
