import React from 'react';
import MapboxMap from './components/MapboxMap';

//#region circle helper functions
//TODO: Move somewhere else
const EARTH_RADIUS_METERS = 6_371_000;

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value) {
  return (value * 180) / Math.PI;
}

function destinationPoint([longitude, latitude], distanceMeters, bearingDegrees) {
  const angularDistance = distanceMeters / EARTH_RADIUS_METERS;
  const bearing = degreesToRadians(bearingDegrees);
  const latRad = degreesToRadians(latitude);
  const lonRad = degreesToRadians(longitude);

  const destLat = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const destLon =
    lonRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(destLat),
    );

  return [radiansToDegrees(destLon), radiansToDegrees(destLat)];
}

function createCircleFeature({
  center,
  radiusMeters,
  properties = {},
  steps = 64,
}) {
  const coordinates = [];

  for (let step = 0; step <= steps; step += 1) {
    const bearing = (step / steps) * 360;
    coordinates.push(destinationPoint(center, radiusMeters, bearing));
  }

  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
  };
}

//#endregion

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

  const highlightedCircles = [
    createCircleFeature({
      center: [-69.5999, 44.5967],
      radiusMeters: 5000, // ~5km radius
      properties: { name: 'Fairfield Buffer (5km)' },
    }),
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>PFAS Hot Zones</h1>
        <p>Zoom and pan around Maine. Click a marker to see town info.</p>
      </header>

      <main className="canvas-wrap">
        <MapboxMap
          highlightedPolygons={highlightedPolygons}
          highlightedCircles={highlightedCircles}
        />
      </main>
    </div>
  );
}
