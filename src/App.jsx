import React, { useState, useEffect } from "react";

const App = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle geolocation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  // Fetch Qibla direction
  useEffect(() => {
    if (location.latitude && location.longitude) {
      const fetchQiblaDirection = async () => {
        try {
          const response = await fetch(
            `https://api.aladhan.com/v1/qibla/${location.latitude}/${location.longitude}`
          );
          const data = await response.json();
          setQiblaDirection(data.data.direction);
        } catch (err) {
          setError("Failed to fetch Qibla direction.");
        }
      };
      fetchQiblaDirection();
    }
  }, [location]);

  // Handle device orientation
  useEffect(() => {
    const handleOrientation = (event) => {
      setDeviceOrientation(event.alpha); // Alpha is the compass direction
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Calculate the arrow rotation
  const calculateRotation = () => {
    if (qiblaDirection !== null && deviceOrientation !== null) {
      return qiblaDirection - deviceOrientation;
    }
    return 0;
  };

  const arrowRotation = calculateRotation();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Qibla Finder</h1>

      {/* Button to get location */}
      <button
        onClick={handleGeolocation}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
      >
        {loading ? "Fetching Location..." : "Use Current Location"}
      </button>

      {/* Error message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Display Qibla Direction */}
      {qiblaDirection !== null && (
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center border-4 border-blue-500">
            {/* Arrow pointing to Qibla */}
            <div
              className="w-1/2 h-1 bg-red-500 absolute origin-bottom transform"
              style={{ rotate: `${arrowRotation}deg` }}
            ></div>
            {/* Center Point */}
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          </div>
          <p className="mt-4 text-lg text-gray-700">
            The Qibla direction is{" "}
            <span className="font-bold">{qiblaDirection.toFixed(2)}°</span>.
          </p>
          <p className="mt-2 text-green-600 font-semibold">
            Move your device to align the arrow with the Qibla!
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
