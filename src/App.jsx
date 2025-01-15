import React, { useState, useEffect } from "react";

const App = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  const [isQiblaAligned, setIsQiblaAligned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      () => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    if (location.latitude && location.longitude) {
      const fetchQiblaDirection = async () => {
        try {
          const response = await fetch(
            `https://api.aladhan.com/v1/qibla/${location.latitude}/${location.longitude}`
          );
          const data = await response.json();
          setQiblaDirection(data.data.direction);
        } catch {
          setError("Failed to fetch Qibla direction.");
        }
      };
      fetchQiblaDirection();
    }
  }, [location]);

  useEffect(() => {
    const handleOrientation = (event) => {
      setDeviceOrientation(event.alpha || 0);
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (qiblaDirection !== null && deviceOrientation !== null) {
      const rotationDifference = Math.abs(qiblaDirection - deviceOrientation);
      setIsQiblaAligned(rotationDifference <= 5 || rotationDifference >= 355);
    }
  }, [qiblaDirection, deviceOrientation]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white px-4">
      <h1 className="text-4xl font-extrabold mb-6 drop-shadow-md">
        Qibla Finder
      </h1>

      <button
        onClick={handleGeolocation}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 mb-6 font-semibold"
      >
        {loading ? "Fetching Location..." : "Use Current Location"}
      </button>

      {error && (
        <p className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </p>
      )}

      {qiblaDirection !== null && (
        <div className="flex flex-col items-center mt-6">
          <div className="relative w-64 h-64 bg-white rounded-full flex items-center justify-center border-4 border-green-500 shadow-lg">
            {/* Qibla Icon */}
            <div
              className="absolute w-10 h-10 transform origin-center"
              style={{
                transform: `rotate(${qiblaDirection - deviceOrientation}deg)`,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`w-full h-full ${
                  isQiblaAligned ? "text-green-500" : "text-red-500"
                }`}
              >
                <path
                  fillRule="evenodd"
                  d="M12 2l4 6h-3v7h-2V8H8l4-6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Center Point */}
            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
          </div>

          <p className="mt-4 text-xl font-medium">
            {isQiblaAligned ? (
              <span className="text-green-300 font-bold">Aligned with Qibla!</span>
            ) : (
              "Rotate your device to find the Qibla."
            )}
          </p>
          <p className="mt-2 text-lg">
            Qibla direction is{" "}
            <span className="font-bold text-yellow-300">
              {qiblaDirection.toFixed(2)}°
            </span>.
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
