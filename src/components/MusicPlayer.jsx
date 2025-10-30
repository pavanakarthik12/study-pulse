import React, { useState, useEffect } from "react";
import './MusicPlayer.css';

export default function MusicPlayer({ isActive }) {
  const [url, setUrl] = useState(localStorage.getItem("musicUrl") || "");
  const [videoId, setVideoId] = useState("");

  useEffect(() => {
    if (url) {
      const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
      if (match && match[1]) {
        setVideoId(match[1]);
      }
    }
  }, [url]);

  const handlePlay = () => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    if (match && match[1]) {
      setVideoId(match[1]);
      localStorage.setItem("musicUrl", url);
    } else {
      alert("Please enter a valid YouTube link.");
    }
  };

  if (!isActive) return null;

  return (
    <div className="music-player-container">
      <h3 className="music-player-title">🎵 Study Music Player</h3>
      <div className="music-player-controls">
        <input
          type="text"
          placeholder="Paste YouTube link..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="music-player-input"
        />
        <button
          onClick={handlePlay}
          className="music-player-button"
        >
          Play
        </button>
      </div>

      {videoId && (
        <iframe
          width="100%"
          height="180"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`}
          title="YouTube Player"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="music-player-iframe"
        ></iframe>
      )}
    </div>
  );
}
