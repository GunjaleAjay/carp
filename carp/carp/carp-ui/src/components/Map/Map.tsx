import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  sx?: any;
  markers?: Array<{ lat: number; lng: number; popup?: string }>;
  route?: { geometry?: { coordinates?: number[][] } };
}

// Component to update map center when props change
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const Map: React.FC<MapProps> = ({ center, zoom, sx, markers = [], route }) => {
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side (Leaflet requires window object)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const centerArray: [number, number] = [center.lat, center.lng];

  // Convert GeoJSON coordinates to Leaflet format [lat, lng]
  const routePolyline = route?.geometry?.coordinates?.map((coord: number[]) => 
    [coord[1], coord[0]] as [number, number]
  ) || [];

  if (!isClient) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'grey.100',
          ...sx,
        }}
      >
        Loading map...
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '400px', ...sx }}>
      <MapContainer
        center={centerArray}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={centerArray} zoom={zoom} />
        {routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{ color: '#1976d2', weight: 4, opacity: 0.7 }}
          />
        )}
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default Map;
