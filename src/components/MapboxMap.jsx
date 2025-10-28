import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';

export default function MapboxMap({
  center = [-68.972, 44.8],
  zoom = 6,
  highlightedPlaces = [],
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    const token = import.meta.env?.VITE_MAPBOX_TOKEN;

    if (!token) {
      console.warn('Mapbox access token missing. Set VITE_MAPBOX_TOKEN in your env.');
      return undefined;
    }

    mapboxgl.accessToken = token;
    const container = containerRef.current;
    if (!container) return undefined;

    const map = new mapboxgl.Map({
      container,
      style: MAP_STYLE,
      center,
      zoom,
      attributionControl: true,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'imperial' }), 'bottom-left');

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    highlightedPlaces.forEach(({ coordinates, name, description }) => {
      if (!coordinates || coordinates.length !== 2) return;

      const marker = new mapboxgl.Marker({ color: '#0f766e' })
        .setLngLat(coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setHTML(
            `<strong>${name ?? 'Unknown place'}</strong>${description ? `<p>${description}</p>` : ''}`,
          ),
        )
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [highlightedPlaces]);

  return <div ref={containerRef} className="mapbox-map" aria-label="Map showing highlighted towns" />;
}
