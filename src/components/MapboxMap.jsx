import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';

export default function MapboxMap({
  center = [-68.972, 44.8],
  zoom = 6,
  highlightedPolygons = [],
  highlightedCircles = [],
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

    const polygonSourceId = 'highlight-polygons';
    const polygonFillLayerId = 'highlight-polygons-fill';
    const polygonOutlineLayerId = 'highlight-polygons-outline';
    const circleSourceId = 'highlight-circles';
    const circleFillLayerId = 'highlight-circles-fill';
    const circleOutlineLayerId = 'highlight-circles-outline';

    const ensurePolygonLayers = () => {
      if (!map.getSource(polygonSourceId)) {
        map.addSource(polygonSourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: highlightedPolygons,
          },
        });
      }

      if (!map.getLayer(polygonFillLayerId)) {
        map.addLayer({
          id: polygonFillLayerId,
          type: 'fill',
          source: polygonSourceId,
          paint: {
            'fill-color': '#ffcc33',
            'fill-opacity': 0.35,
          },
        });
      }

      if (!map.getLayer(polygonOutlineLayerId)) {
        map.addLayer({
          id: polygonOutlineLayerId,
          type: 'line',
          source: polygonSourceId,
          paint: {
            'line-color': '#d48b20',
            'line-width': 2,
          },
        });
      }
    };

    const ensureCircleLayers = () => {
      if (!map.getSource(circleSourceId)) {
        map.addSource(circleSourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: highlightedCircles,
          },
        });
      }

      if (!map.getLayer(circleFillLayerId)) {
        map.addLayer({
          id: circleFillLayerId,
          type: 'fill',
          source: circleSourceId,
          paint: {
            'fill-color': '#ffcc33',
            'fill-opacity': 0.25,
          },
        });
      }

      if (!map.getLayer(circleOutlineLayerId)) {
        map.addLayer({
          id: circleOutlineLayerId,
          type: 'line',
          source: circleSourceId,
          paint: {
            'line-color': '#d48b20',
            'line-width': 1.5,
          },
        });
      }
    };

    const updateSources = () => {
      const polygonSource = map.getSource(polygonSourceId);
      if (polygonSource) {
        polygonSource.setData({
          type: 'FeatureCollection',
          features: highlightedPolygons,
        });
      }

      const circleSource = map.getSource(circleSourceId);
      if (circleSource) {
        circleSource.setData({
          type: 'FeatureCollection',
          features: highlightedCircles,
        });
      }
    };

    const addHighlightLayers = () => {
      ensurePolygonLayers();
      ensureCircleLayers();
      updateSources();
    };

    const loadHandler = () => {
      addHighlightLayers();
    };

    if (map.isStyleLoaded()) {
      addHighlightLayers();
    } else {
      map.once('load', loadHandler);
    }

    return () => {
      map.off('load', loadHandler);
    };
  }, [highlightedPolygons, highlightedCircles]);

  return <div ref={containerRef} className="mapbox-map" aria-label="Map showing highlighted towns" />;
}
