import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiNavigation, FiCheckCircle } from 'react-icons/fi';
import MapView from '../components/MapView';
import VehicleSelector from '../components/VehicleSelector';
import FareEstimate from '../components/FareEstimate';
import { rideService, driverService } from '../services/api';

const BookRide = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [vehicleType, setVehicleType] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [fareEstimates, setFareEstimates] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [clickMode, setClickMode] = useState('pickup');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);

  useEffect(() => {
    if (pickup) {
      driverService.getNearby(pickup.lat, pickup.lng, 5000)
        .then(res => {
          const drivers = res.data.drivers || res.data || [];
          setNearbyDrivers(Array.isArray(drivers) ? drivers : []);
        })
        .catch(() => setNearbyDrivers([]));
    }
  }, [pickup]);

  useEffect(() => {
    if (pickup && dropoff) {
      const distance = getDistance(pickup, dropoff);
      const estimates = {
        auto: Math.round(30 + distance * 12),
        bike: Math.round(20 + distance * 8),
        sedan: Math.round(50 + distance * 15),
        suv: Math.round(80 + distance * 20),
      };
      setFareEstimates(estimates);
    }
  }, [pickup, dropoff]);

  useEffect(() => {
    if (pickup && dropoff && vehicleType && fareEstimates) {
      const total = fareEstimates[vehicleType];
      const baseFare = vehicleType === 'bike' ? 20 : vehicleType === 'auto' ? 30 : vehicleType === 'sedan' ? 50 : 80;
      const distance = getDistance(pickup, dropoff);
      setFareEstimate({
        baseFare,
        distanceFare: Math.round(distance * (vehicleType === 'bike' ? 8 : vehicleType === 'auto' ? 12 : vehicleType === 'sedan' ? 15 : 20)),
        timeFare: Math.round(distance * 2),
        surgeFare: 0,
        discount: 0,
        totalFare: total,
      });
    }
  }, [vehicleType, fareEstimates]);

  const getDistance = (p1, p2) => {
    const R = 6371;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((p1.lat * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`);
      const data = await res.json();
      if (data && data.name) {
        return `${data.name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      } else if (data && data.display_name) {
        const shortName = data.display_name.split(',')[0];
        return `${shortName} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const handleMapClick = async (latlng) => {
    const { lat, lng } = latlng;
    const coordsStr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    if (clickMode === 'pickup') {
      setPickup({ lat, lng });
      setMapCenter([lat, lng]);
      setPickupAddress(`Loading... (${coordsStr})`);
      const addr = await getAddressFromCoords(lat, lng);
      setPickupAddress(addr);
      setClickMode('dropoff');
    } else {
      setDropoff({ lat, lng });
      setMapCenter([lat, lng]);
      setDropoffAddress(`Loading... (${coordsStr})`);
      const addr = await getAddressFromCoords(lat, lng);
      setDropoffAddress(addr);
      setClickMode('pickup');
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    
    setPickupAddress('Getting location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setPickup({ lat, lng });
        setMapCenter([lat, lng]);
        setPickupAddress(`Loading... (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        const addr = await getAddressFromCoords(lat, lng);
        setPickupAddress(addr);
        setClickMode('dropoff');
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Could not get your location. Please check permissions or select on map.');
        setPickupAddress('');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleBook = async () => {
    if (!pickup || !dropoff || !vehicleType) return;
    setLoading(true);
    try {
      const res = await rideService.create({
        pickupCoordinates: [pickup.lng, pickup.lat],
        pickupAddress: pickupAddress,
        dropoffCoordinates: [dropoff.lng, dropoff.lat],
        dropoffAddress: dropoffAddress,
        vehicleType,
      });
      const ride = res.data?.data || res.data?.ride || res.data;
      setBookingSuccess(ride);
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', India')}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        // Optionally set pickup to this location if we want, but panning is safer
      } else {
        alert('Location not found in India');
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '70px' }}>
        <div className="glass-card animate-slide-up" style={{ maxWidth: '450px', textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontFamily: 'Outfit', marginBottom: '0.5rem' }}>Ride Booked!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your ride has been requested. We're finding a driver for you.</p>
          {bookingSuccess.otp && (
            <div className="otp-display">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your OTP</div>
              <div className="otp-code">{bookingSuccess.otp}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Share with your driver</div>
            </div>
          )}
          <button
            className="btn btn-primary btn-lg w-full mt-3"
            onClick={() => navigate(`/ride/${bookingSuccess._id}`)}
          >
            Track Your Ride
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-form">
        <h2 style={{ fontFamily: 'Outfit', marginBottom: '1.5rem' }}>Book a Ride</h2>

        <div className="location-input-group">
          <div className="location-dot pickup"></div>
          <div style={{ flex: 1 }}>
            <input
              className="form-input"
              placeholder="Pickup location"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              readOnly
            />
          </div>
        </div>

        <div style={{ marginLeft: '5px', marginBottom: '0.5rem' }}>
          <div className="location-line"></div>
        </div>

        <div className="location-input-group">
          <div className="location-dot dropoff"></div>
          <div style={{ flex: 1 }}>
            <input
              className="form-input"
              placeholder="Dropoff location"
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              readOnly
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0', flexDirection: 'column' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search city/area (e.g. Mumbai)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              Search
            </button>
          </form>
          <button className="btn btn-secondary btn-sm" onClick={useMyLocation} style={{ alignSelf: 'flex-start' }}>
            <FiNavigation size={14} /> Use My Location
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          💡 Click on the map to set {clickMode} location
        </p>

        {pickup && dropoff && (
          <VehicleSelector
            selectedType={vehicleType}
            onSelect={setVehicleType}
            fareEstimates={fareEstimates}
          />
        )}

        {fareEstimate && <FareEstimate fare={fareEstimate} />}

        {pickup && dropoff && vehicleType && (
          <button
            className="btn btn-primary btn-lg w-full mt-3"
            onClick={handleBook}
            disabled={loading}
          >
            {loading ? <><div className="spinner spinner-sm"></div> Booking...</> : <><FiCheckCircle /> Book Now</>}
          </button>
        )}
      </div>

      <div className="booking-map">
        <MapView
          center={mapCenter}
          pickupLocation={pickup}
          dropoffLocation={dropoff}
          onMapClick={handleMapClick}
          nearbyDrivers={nearbyDrivers}
          height="100%"
          interactive={true}
        />
      </div>
    </div>
  );
};

export default BookRide;
