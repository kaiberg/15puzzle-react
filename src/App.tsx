import './App.css';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {Footer} from "./Footer";
import Header from "./Header";
import Game from "./Game";

function App() {
  return (
    <div className="flex column center" style={{ width: '100%' }}>
      <div>
        <Header />
        <Game />
        <Footer />
      </div>
    </div>
  );
}

export default App;
