import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import VoiceRecorder from '../components/VoiceRecorder';
import ResponseBubble from '../components/ResponseBubble';
import SchemeCard from '../components/SchemeCard';
import * as api from '../services/api';

// No mock data needed as we'll fetch real data from the API

const HomeScreen = () => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [expandedSchemeId, setExpandedSchemeId] = useState(null);
  const [sound, setSound] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');

  // Clean up sound on unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleRecordingComplete = async (recordingData) => {
    try {
      setIsLoading(true);
      setResponse('');
      setSchemes([]);
      
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Image 
          source={require('../assets/icon.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Maitri AI</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>नमस्ते! मैं आपकी सहायता के लिए हूँ</Text>
          <Text style={styles.welcomeSubtitle}>मुझसे सरकारी योजनाओं के बारे में पूछें</Text>
        </View>
        
        {(response || isLoading) && (
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
        )}
        
        {schemes.length > 0 && (
          <View style={styles.schemesContainer}>
            <Text style={styles.schemesTitle}>आपके लिए योजनाएँ:</Text>
            {schemes.map((scheme) => (
              <SchemeCard 
                key={scheme.id}
                scheme={scheme}
                expanded={expandedSchemeId === scheme.id}
                onToggleExpand={() => toggleSchemeExpand(scheme.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      
      <View style={styles.recorderContainer}>
        <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6A0DAD',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  welcomeContainer: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  schemesContainer: {
    padding: 16,
  },
  schemesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recorderContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});

export default HomeScreen;