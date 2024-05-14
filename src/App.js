// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
import Home from './Home';
import ItemListPage from './ItemListPage'; 
import Navigation from './Navigation';
import UploadForm from './UploadForm'; // Import the UploadForm component


// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#ffffff',
//     },
//   },
// });

export default function App() {
  return (
  <div className="ml-[50px]">          
  <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/items" element={<ItemListPage />} /> */}
          <Route path="/upload" element={<UploadForm />} /> {/* Add a route for UploadForm */}
        </Routes>
      </Router>
  </div>
  );
}
