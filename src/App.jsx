import React, { useState, useEffect } from "react";

const App = () => {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  const [isAligned, setIsAligned] = useState(false);

  useEffect(() => {
    // Fetch Qibla direction for the user's location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`
        );
        const data = await response.json();
        setQiblaDirection(data.data.direction);
      },
      () => alert("Unable to access location. Please enable location services.")
    );
  }, []);

  useEffect(() => {
    // Track device orientation
    const handleOrientation = (event) => {
      setDeviceOrientation(event.alpha || 0);
    };
    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  useEffect(() => {
    if (qiblaDirection !== null) {
      const diff = Math.abs(qiblaDirection - deviceOrientation);
      setIsAligned(diff <= 10 || diff >= 350); // Allow a margin for alignment
    }
  }, [qiblaDirection, deviceOrientation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-teal-400 to-blue-500 text-white">
      <h1 className="text-3xl font-bold mb-6">Qibla Finder</h1>

      {qiblaDirection === null ? (
        <p className="text-lg">Fetching your location and Qibla direction...</p>
      ) : (
        <div className="relative w-64 h-64 bg-white rounded-full shadow-lg border-4 border-teal-500 flex items-center justify-center">
          {/* Qibla Arrow */}
          <div
            className="absolute w-12 h-12 transform origin-center transition-transform duration-300"
            style={{
              transform: `rotate(${qiblaDirection - deviceOrientation}deg)`,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className={`w-full h-full ${
                isAligned ? "text-green-500" : "text-red-500"
              }`}
              viewBox="0 0 24 24"
            >
              <path d="M12 2l4 6h-3v7h-2V8H8l4-6z" />
            </svg>
          </div>

          {/* Center Point */}
          <div className="w-6 h-6 bg-teal-500 rounded-full border-2 border-white"></div>
        </div>
      )}

      {qiblaDirection !== null && (
        <p className="mt-6 text-lg">
          {isAligned ? (
            <span className="text-green-300 font-bold">
              Aligned! This is the Qibla.
            </span>
          ) : (
            "Rotate your device to align with the Qibla."
          )}
        </p>
      )}
    </div>
  );
};

export default App;
