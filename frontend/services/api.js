import * as FileSystem from "expo-file-system";

// Base URL for the backend API
const API_BASE_URL = "http://localhost:8000";

/**
 * Send audio recording to the backend for processing
 * @param {Object} recordingData - Object containing recording URI and metadata
 * @returns {Promise<Object>} - Response from the backend
 */
export const processAudio = async (recordingData) => {
  try {
    const { uri } = recordingData;

    // Create form data with audio file
    const formData = new FormData();
    formData.append("audio_file", {
      uri,
      name: "recording.wav",
      type: "audio/wav",
    });

    // Send request to backend
    const response = await fetch(`${API_BASE_URL}/process-audio`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Server responded with ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error processing audio:", error);
    throw error;
  }
};

/**
 * Get all available government schemes
 * @returns {Promise<Array>} - List of schemes
 */
export const getSchemes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/schemes`);

    if (!response.ok) {
      throw new Error(
        `Server responded with ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.schemes;
  } catch (error) {
    console.error("Error fetching schemes:", error);
    throw error;
  }
};

/**
 * Get details for a specific scheme by ID
 * @param {string} schemeId - ID of the scheme
 * @returns {Promise<Object>} - Scheme details
 */
export const getSchemeById = async (schemeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scheme`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scheme_id: schemeId }),
    });

    if (!response.ok) {
      throw new Error(
        `Server responded with ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.scheme;
  } catch (error) {
    console.error("Error fetching scheme details:", error);
    throw error;
  }
};

/**
 * Download and play audio response from the backend
 * @param {string} audioUrl - URL of the audio file (can be relative or absolute)
 * @returns {Promise<string>} - Local URI of the downloaded audio file
 */
export const downloadAudioResponse = async (audioUrl) => {
  try {
    const fileUri = `${FileSystem.cacheDirectory}response_${Date.now()}.mp3`;

    // If the URL is absolute, use it directly; otherwise, prepend the API base URL
    const fullUrl = audioUrl.startsWith("http")
      ? audioUrl
      : `${API_BASE_URL}${audioUrl}`;

    // Download the file
    const downloadResult = await FileSystem.downloadAsync(fullUrl, fileUri);

    if (downloadResult.status !== 200) {
      throw new Error(`Failed to download audio: ${downloadResult.status}`);
    }

    return fileUri;
  } catch (error) {
    console.error("Error downloading audio response:", error);
    throw error;
  }
};
