import React from 'react';
import MapboxMap from './components/MapboxMap';

export default function App() {

  // TODO: Remove highlightedTowns
  const highlightedPolygons = [
    {
      type: 'Feature',
      properties: { name: 'Fairfield, ME' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-69.6295, 44.6183],
            [-69.5703, 44.6183],
            [-69.5703, 44.5551],
            [-69.6295, 44.5551],
            [-69.6295, 44.6183],
          ],
        ],
      },
    }, // Can add more polygons here following geojson format
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>PFAS Hot Zones</h1>
        <p>Zoom and pan around Maine. Click a marker to see town info.</p>
      </header>

      <main className="canvas-wrap">
        <MapboxMap highlightedPlaces={highlightedPolygons} />
      </main>
    </div>
  );
}
