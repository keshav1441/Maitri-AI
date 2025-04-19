import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const ResponseBubble = ({ message, isLoading, isPlaying, onPlayAudio }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>दी</Text>
        </View>
        <Text style={styles.avatarName}>Data Didi</Text>
      </View>
      
      <View style={styles.bubbleContainer}>
        <View style={styles.bubble}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6A0DAD" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.messageText}>{message}</Text>
              {message && (
                <TouchableOpacity 
                  style={styles.playButton} 
                  onPress={onPlayAudio}
                  disabled={isPlaying}
                >
                  <FontAwesome 
                    name={isPlaying ? "volume-up" : "volume-off"} 
                    size={20} 
                    color={isPlaying ? "#6A0DAD" : "#888"} 
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6A0DAD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bubbleContainer: {
    flex: 1,
  },
  bubble: {
    backgroundColor: '#F0E6FA',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    padding: 12,
    maxWidth: '100%',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6A0DAD',
    fontSize: 14,
  },
  playButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    padding: 6,
  },
});

export default ResponseBubble;