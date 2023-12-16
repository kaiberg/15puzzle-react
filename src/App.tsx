import './App.css';
import React from 'react';
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
