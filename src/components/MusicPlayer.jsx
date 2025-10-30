import React, { useState, useEffect, useRef } from "react";
import './MusicPlayer.css';

const MusicPlayer = () => {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube IFrame API ready');
    };

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoId && window.YT) {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }
  }, [videoId]);

  const onPlayerReady = (event) => {
    const player = event.target;
    setDuration(player.getDuration());
    player.setVolume(volume);
  };

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startTimeUpdate();
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const startTimeUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
  };

  const extractVideoId = (videoUrl) => {
    const match = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    return match ? match[1] : null;
  };

  const handleLoad = () => {
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      setCurrentTime(0);
      setIsPlaying(false);
    } else {
      alert('Please enter a valid YouTube URL');
    }
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.stopVideo();
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleSkipForward = () => {
    if (playerRef.current) {
      const newTime = Math.min(currentTime + 10, duration);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const handleSkipBackward = () => {
    if (playerRef.current) {
      const newTime = Math.max(currentTime - 10, 0);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(newTime, true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="music-player-container">
      <div className="music-player-card">
        <h3 className="player-title">🎵 Study Music Player</h3>
        
        <div className="url-input-section">
          <input
            type="text"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
          />
          <button onClick={handleLoad} className="load-btn">
            Load
          </button>
        </div>

        {videoId && (
          <>
            <div id="youtube-player" style={{ display: 'none' }}></div>
            
            <div className="seek-bar-section">
              <span className="time-display">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="seek-bar"
              />
              <span className="time-display">{formatTime(duration)}</span>
            </div>

            <div className="controls-section">
              <button onClick={handleSkipBackward} className="control-btn-icon" title="-10s">
                ⏪
              </button>
              <button onClick={handlePlayPause} className="control-btn-main" title={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button onClick={handleStop} className="control-btn-icon" title="Stop">
                ⏹️
              </button>
              <button onClick={handleSkipForward} className="control-btn-icon" title="+10s">
                ⏩
              </button>
            </div>

            <div className="volume-section">
              <span className="volume-icon">🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
              <span className="volume-value">{volume}%</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;
