import React, { useState } from 'react';
import { Button, TextField, Input, CircularProgress } from '@mui/material';
import axios from 'axios';

function UploadForm() {
  const [textFields, setTextFields] = useState(['']);
  const [selectedFile, setSelectedFile] = useState('');
  const [uploadTranscriptText, setUploadTranscriptText] = useState('');
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isUploadError, setIsUploadError] = useState(false);

  const handleAddField = () => {
    if (textFields.length < 5) {
      setTextFields([...textFields, '']);
    }
  };

  const handleChangeField = (index, event) => {
    const newTextFields = [...textFields];
    newTextFields[index] = event.target.value;
    setTextFields(newTextFields);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  async function transcribe(audio_url) {
    const response = await axios
      .post('http://localhost:8000/transcript', { audio_url })
      .catch((error) => {
        alert(error.response.data.error);
        return null;
      });
  
    return response?.data;
  }

  const handleSubmit = async () => {
    setIsUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      textFields.forEach((field, index) => {
        formData.append(`textField${index + 1}`, field);
      });

      // Log the formData contents to the console
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

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
  

      //const additionalData = { textFields };

      return transcribe(response?.data);

    } catch (error) {
      setIsUploadError(true);
      console.error(error);
    } finally {
      setIsUploadLoading(false);
    }
  };

  return (
    <div>
      <Input type="file" onChange={handleFileChange} />
      <Button onClick={handleAddField} disabled={textFields.length >= 5}>
        Add Text Field
      </Button>
      {textFields.map((field, index) => (
        <TextField
          key={index}
          value={field}
          onChange={(event) => handleChangeField(index, event)}
          label={`Text Field ${index + 1}`}
          variant="outlined"
          margin="normal"
          fullWidth
        />
      ))}
      <div className="button-holder">
        {isUploadLoading ? (
          <CircularProgress color="primary" />
        ) : (
          <Button onClick={handleSubmit} variant="outlined">
            Submit
          </Button>
        )}
      </div>
      {uploadTranscriptText && (
        <div className="transcript-holder">
          <p className="transcript">{uploadTranscriptText}</p>
        </div>
      )}
    </div>
  );
}

export default UploadForm;
