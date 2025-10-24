import React from 'react';
import ThreeScene from './components/ThreeScene';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>React + Three.js Starter</h1>
        <p>Drag to orbit, scroll to zoom. Built with OrbitControls.</p>
      </header>

      <main className="canvas-wrap">
        <ThreeScene />
      </main>

      <footer className="app-footer">
        <small>Frontend-only for now — branch later to add a backend.</small>
      </footer>
    </div>
  );
}