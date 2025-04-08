import React, { useEffect, useRef, useState } from "react";

// Load YouTube API once
function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      document.body.appendChild(tag);
    }
  });
}

const CustomYouTubePlayer = ({ videoId }) => {
  const playerRef = useRef(null); // DOM ref to insert iframe
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Available speed options
  const speedOptions = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  useEffect(() => {
    loadYouTubeAPI().then((YT) => {
      const newPlayer = new YT.Player(playerRef.current, {
        height: "315",
        width: "100%",
        videoId: videoId,
        playerVars: {
          controls: 0,          // Hide default controls
          modestbranding: 1,    // Remove YouTube logo
          rel: 0,               // Disable related videos
          disablekb: 1,         // Disable keyboard
          showinfo: 0,          // Hide title (legacy)
        },
        events: {
          onReady: () => setPlayer(newPlayer),
          onStateChange: (event) => {
            setIsPlaying(event.data === YT.PlayerState.PLAYING);
          },
        },
      });
    });
  }, [videoId]);

  const handlePlay = () => {
    if (player) player.playVideo();
  };

  const handlePause = () => {
    if (player) player.pauseVideo();
  };

  const toggleSpeedMenu = () => {
    setShowSpeedMenu(!showSpeedMenu);
  };

  const changeSpeed = (speed) => {
    if (player) {
      player.setPlaybackRate(speed);
      setCurrentSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg">
      {/* YouTube Player goes here */}
      <div ref={playerRef} />

      {/* Custom Controls */}
      <div className="absolute bottom-4 left-4 flex gap-3 items-center">
        <button
          onClick={handlePlay}
          className="bg-green-500 text-white px-4 py-2 rounded shadow-md hover:bg-green-600"
        >
          ▶ Play
        </button>
        <button
          onClick={handlePause}
          className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600"
        >
          ⏸ Pause
        </button>
        <div className="relative">
          <button
            onClick={toggleSpeedMenu}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600"
          >
            {currentSpeed}x
          </button>
          
          {/* Speed Menu Dropdown */}
          {showSpeedMenu && (
            <div className="absolute bottom-12 left-0 bg-white rounded-md shadow-lg p-2 z-10">
              {speedOptions.map((speed) => (
                <button
                  key={speed}
                  onClick={() => changeSpeed(speed)}
                  className={`block w-full text-left px-4 py-2 rounded ${
                    currentSpeed === speed
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Current Speed Indicator */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-2 py-1 rounded">
        {currentSpeed}x
      </div>
    </div>
  );
};

export default CustomYouTubePlayer;
