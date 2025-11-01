import React from 'react';
import MapboxMap from './components/MapboxMap';

export default function App() {

  // TODO: Remove highlightedTowns
  const highlightedTowns = [
    {
      name: 'Portland, ME',
      description: 'Lobster capital and arts district on the coast.',
      coordinates: [-70.2553, 43.6591],
    },
    {
      name: 'Bangor, ME',
      description: 'Gateway to the Maine Highlands.',
      coordinates: [-68.7779, 44.8012],
    },
    {
      name: 'Bar Harbor, ME',
      description: 'Village on Mount Desert Island next to Acadia National Park.',
      coordinates: [-68.2039, 44.3876],
    },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>PFAS Hot Zones</h1>
        <p>Zoom and pan around Maine. Click a marker to see town info.</p>
      </header>

      <main className="canvas-wrap">
        <MapboxMap highlightedPlaces={highlightedTowns} />
      </main>
    </div>
  );
}
