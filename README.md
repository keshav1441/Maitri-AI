# Maitri AI - Women-Centric AI Scheme Advisor

Maitri AI is a voice-driven AI assistant designed to help rural women discover and understand relevant government schemes with empathy, in their local language, and without needing to read or type.

## Features

- **Voice Input**: Users speak into the app using a push-to-talk mic button
- **Speech-to-Text**: Transcribes audio using Coqui STT
- **Intent Classification**: Uses GeminiAPI to classify intent and extract user profile info
- **Scheme Matching**: Checks a pre-defined scheme database to find eligible government schemes
- **Response Generation**: GeminiAPI generates friendly, clear responses in natural Hinglish
- **Voice Output**: Uses Coqui TTS to generate a calm, trustworthy "Data Didi" voice
- **Empathy Layer**: Adjusts tone and explanation if user sounds confused
- **Display**: Shows scheme title, eligibility, required documents, and steps

## Technology Stack

- **Frontend**: React Native (Expo)
- **Backend**: FastAPI
- **STT**: Coqui STT
- **NLU**: GeminiAPI
- **TTS**: Coqui TTS
- **Database**: MongoDB
- **Deployment**: Render / Railway / Fly.io

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

## Project Structure

```
├── frontend/           # React Native app
│   ├── components/     # Reusable UI components
│   ├── screens/       # App screens
│   ├── services/      # API services
│   └── assets/        # Images, fonts, etc.
├── backend/           # FastAPI server
│   ├── api/           # API endpoints
│   ├── models/        # Data models
│   ├── services/      # Business logic
│   └── data/          # Scheme database
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
