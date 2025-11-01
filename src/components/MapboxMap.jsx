import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';

export default function MapboxMap({
  center = [-68.972, 44.8],
  zoom = 6,
  highlightedPolygons = [],
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Grab token from environment variable
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
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    const sourceId = 'fairfield-highlight';
    // Each layer can have a single style but multiple poligons
    const layerId = 'fairfield-highlight-fill';

    const addHighlight = () => {
      if (map.getLayer(layerId)) return;

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: highlightedPolygons, // Only adding the first polygon for now
        },
      });

      map.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#ffcc33',
          'fill-opacity': 0.35,
        },
      });

      map.addLayer({
        id: `${layerId}-outline`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#d48b20',
          'line-width': 2,
        },
      });
    };

    const loadHandler = () => 
    {
      addHighlight();
    };

    if (map.isStyleLoaded()) 
    {
      addHighlight();
    } 
    else 
    {
      // Attach a one-time load listener via map.once('load', loadHandler)
      map.once('load', loadHandler);
    }

    return () => 
    {
      map.off('load', loadHandler);
      if (map.getLayer(layerId)) 
      {
        map.removeLayer(layerId);
      }
      if (map.getLayer(`${layerId}-outline`)) 
      {
        map.removeLayer(`${layerId}-outline`);
      }
      if (map.getSource(sourceId)) 
      {
        map.removeSource(sourceId);
      }
    };
  }, [highlightedPolygons]);

  return <div ref={containerRef} className="mapbox-map" aria-label="Map showing highlighted towns" />;
}
