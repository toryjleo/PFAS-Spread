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
  // TODO: Remove markersRef and related code when highlightedPlaces is removed
  const markersRef = useRef([]);

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

    const sourceId = 'fairfield-highlight';
    // Each layer can have a single style but multiple poligons
    const layerId = 'fairfield-highlight-fill';

    const addHighlight = () => {
      if (map.getLayer(layerId)) return;

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
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
            },
          ],
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
  }, []);

  // tODO: Remove this effect and related code when highlightedPlaces is removed
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    highlightedPlaces.forEach(({ coordinates, name, description }) => {
      if (!coordinates || coordinates.length !== 2) return;

      const marker = new mapboxgl.Marker({ color: '#b67e17ff' })
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
