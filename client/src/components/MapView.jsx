import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const createIcon = (color, label, size = 30) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px; height: ${size}px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      display: flex; align-items: center; justify-content: center;
      font-size: ${size * 0.4}px; font-weight: 700; color: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    ">${label}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const pickupIcon = createIcon('#00E676', 'P');
const dropoffIcon = createIcon('#FF5252', 'D');
const driverIcon = createIcon('#6C63FF', '🚗', 35);
const nearbyDriverIcon = createIcon('#00D9FF', '•', 18);

const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const MapView = ({
  center = [12.9716, 77.5946],
  zoom = 13,
  pickupLocation,
  dropoffLocation,
  driverLocation,
  onMapClick,
  interactive = true,
  height = '400px',
  nearbyDrivers = [],
}) => {
  const positions = [];
  if (pickupLocation) positions.push([pickupLocation.lat, pickupLocation.lng]);
  if (dropoffLocation) positions.push([dropoffLocation.lat, dropoffLocation.lng]);

  const indiaBounds = [
    [6.7535, 68.0321], // South-West
    [35.5013, 97.3953] // North-East
  ];

  return (
    <div className="map-container" style={{ height, minHeight: '400px', width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={5}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {interactive && onMapClick && <MapEvents onMapClick={onMapClick} />}

        {pickupLocation && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}

        {dropoffLocation && (
          <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon}>
            <Popup>Dropoff Location</Popup>
          </Marker>
        )}

        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>Driver Location</Popup>
          </Marker>
        )}

        {nearbyDrivers.map((driver, idx) => (
          <Marker
            key={idx}
            position={[driver.lat || driver.location?.lat, driver.lng || driver.location?.lng]}
            icon={nearbyDriverIcon}
          >
            <Popup>{driver.name || 'Available Driver'}</Popup>
          </Marker>
        ))}

        {pickupLocation && dropoffLocation && (
          <Polyline
            positions={positions}
            pathOptions={{ color: '#6C63FF', weight: 4, opacity: 0.8, dashArray: '10, 10' }}
          />
        )}

        <RecenterMap center={center} />
      </MapContainer>
    </div>
  );
};

export default MapView;
