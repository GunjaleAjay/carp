import { MapContainer, TileLayer, Marker, useMap, Polyline, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import L from "leaflet";

// Car icon for the moving marker
const carIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Component to handle map centering when position updates
function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return null;
}

export default function RealTimeMap({ trip }) {
  // Initialize position from trip or default
  const initialPosition = trip?.origin_lat && trip?.origin_lng 
    ? [trip.origin_lat, trip.origin_lng]
    : [17.385, 78.486];
  
  const [position, setPosition] = useState(initialPosition);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Get route polyline from trip data
  const routePolyline = trip?.route_data?.geometry?.coordinates?.map((coord) => 
    [coord[1], coord[0]] // Convert [lng, lat] to [lat, lng]
  ) || [];

  useEffect(() => {
    // Connect to Socket.io server
    const newSocket = io("http://localhost:3001", {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to live tracking server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from live tracking server');
      setIsConnected(false);
    });

    // Listen for location updates
    newSocket.on("locationUpdate", (coords) => {
      console.log('Received location update:', coords);
      setPosition(coords);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div style={{ position: 'relative', height: '500px', width: '100%' }}>
      {/* Connection status indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: isConnected ? '#4CAF50' : '#f44336',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {isConnected ? '🟢 LIVE' : '🔴 DISCONNECTED'}
      </div>

      <MapContainer
        center={position}
        zoom={trip?.distance_km && trip.distance_km > 50 ? 10 : trip?.distance_km && trip.distance_km > 20 ? 12 : 15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Route polyline if trip data available */}
        {routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{ color: '#1976d2', weight: 4, opacity: 0.7 }}
          />
        )}

        {/* Origin marker */}
        {trip?.origin_lat && trip?.origin_lng && (
          <Marker position={[trip.origin_lat, trip.origin_lng]}>
            <Popup>Origin: {trip.from}</Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {trip?.destination_lat && trip?.destination_lng && (
          <Marker position={[trip.destination_lat, trip.destination_lng]}>
            <Popup>Destination: {trip.to}</Popup>
          </Marker>
        )}

        {/* Moving car marker */}
        <Marker position={position} icon={carIcon} />

        {/* Auto-center map on position updates */}
        <MapController position={position} />
      </MapContainer>

      {/* Info panel */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '12px'
      }}>
        <strong>Real-Time GPS Tracking</strong><br/>
        Lat: {position[0].toFixed(6)}<br/>
        Lng: {position[1].toFixed(6)}<br/>
        <small>Updates every second</small>
      </div>
    </div>
  );
}