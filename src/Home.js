import React, { useState } from 'react';
import axios from 'axios';
import Logo from './assembly_logo.png';
import { Button, CircularProgress, Input, TextField } from '@mui/material';

async function transcribe(audio_url, requestId) {
  const response = await axios
    .post('http://localhost:8000/transcript', { audio_url, requestId })
    .catch((error) => {
      alert(error.response.data.error);
      return null;
    });

  return response?.data;
}

async function upload(file, questions) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('questions', JSON.stringify(questions)); // Send questions as a JSON string

  const response = await axios
    .post('http://localhost:8000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .catch((error) => {
      alert(error.response.data.error);
      return null;
    });

  return response?.data; // Return the response containing uploadUrl and requestId
}

export default function Home() {
  const [audioUrl, setAudioUrl] = useState('');
  const [isUploadError, setIsUploadError] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isUrlError, setIsUrlError] = useState(false);
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTranscriptText, setUploadTranscriptText] = useState('');
  const [urlTranscriptText, setUrlTranscriptText] = useState('');
  const [questions, setQuestions] = useState([{ question: '', answer_format: '' }]);

  const onChangeFile = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onChangeUrl = (event) => {
    setAudioUrl(event.target.value);
  };

  const handleAddField = () => {
    if (questions.length < 5) {
      setQuestions([...questions, { question: '', answer_format: '' }]);
    }
  };

  const handleChangeField = (index, field, event) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = event.target.value;
    setQuestions(newQuestions);
  };

  const onClickSubmit = (type) => () => {
    if (type === 'audio_url' && audioUrl === '') {
      setIsUrlError(true);
    } else if (type === 'audio_url' && audioUrl !== '') {
      setIsUrlError(false);
      setIsUrlLoading(true);
      transcribe(audioUrl, null).then((result) => {
        setIsUrlLoading(false);
        if (result) {
          setUrlTranscriptText(result.text);
        }
      });
    } else if (type === 'uploaded_file' && !selectedFile) {
      setIsUploadError(true);
    } else if (type === 'uploaded_file' && selectedFile) {
      setIsUploadError(false);
      setIsUploadLoading(true);
      upload(selectedFile, questions).then((result) => {
        setIsUploadLoading(false);
        if (result) {
          console.log(result);
          const { uploadUrl, requestId } = result; // Extract requestId from the response
          transcribe(uploadUrl, requestId).then((transcriptResult) => {
            if (transcriptResult) {
              setUploadTranscriptText(transcriptResult.text);
            }
          });
        }
      });
    }
  };

  return (
    <div className="app">
      <div className="content">
        <img alt="AssemblyAI Logo" className="logo" src={Logo} />
        <p>Welcome to AssemblyAI's React demo!</p>
        <p>
          This will show you how to use our async API within a React project...
        </p>
        <div className="split">
          <div className="pane">
            <p>
              ...via our{' '}
              <a
                className="link"
                href="https://www.assemblyai.com/docs/Models/speech_recognition#quickstart"
              >
                audio_url parameter
              </a>
              ...
            </p>
            <TextField
              error={isUrlError}
              focused={true}
              label="URL"
              onChange={onChangeUrl}
              sx={{ input: { color: '#ffffff' }, width: '50%' }}
              value={audioUrl}
            />
            <div className="button-holder">
              {isUrlLoading ? (
                <CircularProgress color="primary" />
              ) : (
                <Button onClick={onClickSubmit('audio_url')} variant="outlined">
                  Submit
                </Button>
              )}
            </div>
            {urlTranscriptText !== '' ? (
              <div className="transcript-holder">
                <p className="transcript">{urlTranscriptText}</p>
              </div>
            ) : null}
          </div>
          <div className="pane">
            <p>
              ...or by{' '}
              <a
                className="link"
                href="https://www.assemblyai.com/docs/Guides/transcribing_an_audio_file"
              >
                uploading a file!
              </a>
            </p>
            <Input
              defaultValue={selectedFile}
              error={isUploadError}
              onChange={onChangeFile}
              sx={{ input: { color: '#ffffff' }, width: '50%' }}
              type="file"
            />
            <Button onClick={handleAddField} disabled={questions.length >= 5}>
              Add Question Field
            </Button>
            {questions.map((q, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <TextField
                  label={`Question ${index + 1}`}
                  value={q.question}
                  onChange={(event) => handleChangeField(index, 'question', event)}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                />
                <TextField
                  label={`Answer Format ${index + 1}`}
                  value={q.answer_format}
                  onChange={(event) => handleChangeField(index, 'answer_format', event)}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                />
              </div>
            ))}
            <div className="button-holder">
              {isUploadLoading ? (
                <CircularProgress color="primary" />
              ) : (
                <Button onClick={onClickSubmit('uploaded_file')} variant="outlined">
                  Submit
                </Button>
              )}
            </div>
            {uploadTranscriptText !== '' ? (
              <div className="transcript-holder">
                <p className="transcript">{uploadTranscriptText}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
