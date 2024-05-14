// src/Navigation.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <div className="ml-[10em]">
    <nav className="ml-10 flex space-x-4 p-4 bg-blue-500 text-white">
      <Link to="/" className="hover:text-gray-200">Home</Link><br/>
      <Link to="/home" className="hover:text-gray-200">Home (Alt)</Link>
      <Link to="/items" className="hover:text-gray-200">Item List</Link>
    </nav>
    </div>
  );
}
