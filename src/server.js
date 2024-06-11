require('dotenv').config();
const cors = require('cors');
const express = require('express');
const fs = require('fs/promises');
const multer = require('multer');
const { AssemblyAI } = require('assemblyai');

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: 'temp' });

// In-memory store for temporary data
const temporaryStore = {};

app.post('/upload', upload.single('file'), async (req, res) => {
  try { 
    const uploadUrl = await client.files.upload(req.file.path);
    await fs.rm(req.file.path); // Remove file from temp storage.

    // Store questions in the temporary store using a unique identifier
    const requestId = req.file.filename; // Using the filename as a unique ID
    temporaryStore[requestId] = JSON.parse(req.body.questions); // Parse the questions JSON string

    res.json({ uploadUrl, requestId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/transcript', async (req, res) => {
  try {
    const { audio_url, requestId } = req.body;

    // Retrieve the questions from the temporary store
    const questions = temporaryStore[requestId];
    if (!questions) {
      return res.status(400).json({ error: 'Invalid request ID or no questions found' });
    }

    // Transcribe the audio using AssemblyAI
    const transcript = await client.transcripts.transcribe({
      audio: audio_url,
    });

    if (transcript.status === 'error') {
      return res.status(500).json(transcript);
    }

    // Polling with exponential backoff
    const transcriptId = transcript.id;
    let completedTranscript = null;
    let delay = 5000; // Start with 5 seconds
    while (completedTranscript === null || completedTranscript.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, delay));
      completedTranscript = await client.transcripts.get(transcriptId);
      if (completedTranscript.status === 'error') {
        return res.status(500).json(completedTranscript);
      }
      delay = Math.min(delay * 2, 60000); // Double the delay up to a maximum of 60 seconds
    }

    // Prepare the data for the question-answer request
    const response = await client.lemur.questionAnswer({
      transcript_ids: [transcriptId],
      questions,
      context: "This is an interview about wildfires.", // You can adjust this context as needed
      final_model: "default",
      max_output_size: 3000,
      temperature: 0,
    });
console.log(response);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.set('port', 8000);
const server = app.listen(app.get('port'), () => {
  console.log(`Server is running on port ${server.address().port}`);
});
