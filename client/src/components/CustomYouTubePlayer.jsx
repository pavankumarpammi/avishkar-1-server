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

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg">
      {/* YouTube Player goes here */}
      <div ref={playerRef} />

      {/* Custom Buttons */}
      <div className="absolute bottom-4 left-4 flex gap-3">
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
      </div>
    </div>
  );
};

export default CustomYouTubePlayer;
