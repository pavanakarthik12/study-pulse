import React, { useState, useEffect, useRef } from "react";
import './MusicPlayer.css';

// Curated calm focus playlists
const CALM_PLAYLISTS = [
  { id: 'lofi', name: '🎧 Lofi Beats', videos: [
    { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio' },
    { id: '5qap5aO4i9A', title: 'Chill Lofi Study' },
    { id: 'lTRiuFIWV54', title: 'Peaceful Lofi' }
  ]},
  { id: 'ambient', name: '🌊 Ambient', videos: [
    { id: 'DWcJFNfaw9c', title: 'Ambient Space Music' },
    { id: '1ZYbU82GVz4', title: 'Deep Ambient' },
    { id: 'M5QY2_8704o', title: 'Cosmic Ambient' }
  ]},
  { id: 'rain', name: '🌧️ Rain Sounds', videos: [
    { id: 'nDq6TstdEi8', title: 'Rain & Thunder' },
    { id: 'SUiCZ6qTzJE', title: 'Heavy Rain Sounds' },
    { id: 'q76bMs-NwRk', title: 'Gentle Rain' }
  ]},
  { id: 'piano', name: '🎹 Piano', videos: [
    { id: 'EeORDhrZAQQ', title: 'Peaceful Piano' },
    { id: '3jWRrafhO7M', title: 'Relaxing Piano' },
    { id: 'lCOF9LN_Zxs', title: 'Study Piano' }
  ]},
  { id: 'nature', name: '🌲 Nature', videos: [
    { id: 'eKFTSSKCzWA', title: 'Forest Sounds' },
    { id: 'bn9F19Hi1Lk', title: 'Ocean Waves' },
    { id: 'wzjWIxXBs_s', title: 'Birds Singing' }
  ]}
];

const MusicPlayer = () => {
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [showAddSong, setShowAddSong] = useState(false);
  const [newSongUrl, setNewSongUrl] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [selectedUserPlaylist, setSelectedUserPlaylist] = useState(null);
  const [ytReady, setYtReady] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const playerContainerRef = useRef(null);

  // Load user playlists from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('userMusicPlaylists');
    if (saved) {
      try {
        setUserPlaylists(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load playlists:', e);
      }
    }
  }, []);

  // Save user playlists to localStorage
  useEffect(() => {
    if (userPlaylists.length > 0) {
      localStorage.setItem('userMusicPlaylists', JSON.stringify(userPlaylists));
    }
  }, [userPlaylists]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiLoaded(true);
      return;
    }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube IFrame API loaded successfully');
        setApiLoaded(true);
      };
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Initialize or update player when track changes
  useEffect(() => {
    if (!currentPlaylist || !apiLoaded || !window.YT || !window.YT.Player) {
      return;
    }

    const currentTrack = currentPlaylist.videos[currentTrackIndex];
    if (!currentTrack) return;

    // Destroy existing player
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error('Error destroying player:', e);
      }
      playerRef.current = null;
    }

    setYtReady(false);

    try {
      // Create new YT.Player instance
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: currentTrack.id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        },
      });
    } catch (error) {
      console.error('Failed to create YT.Player:', error);
    }
  }, [currentPlaylist, currentTrackIndex, apiLoaded]);

  const onPlayerReady = (event) => {
    console.log('YT Player ready');
    const player = event.target;
    
    try {
      const dur = player.getDuration();
      setDuration(dur);
      player.setVolume(volume);
      setYtReady(true);
      setIsPlaying(true);
      startTimeUpdate();
    } catch (e) {
      console.error('Error in onPlayerReady:', e);
    }
  };

  const onPlayerStateChange = (event) => {
    const state = event.data;
    
    if (state === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startTimeUpdate();
    } else if (state === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else if (state === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      handleNext();
    }
  };

  const onPlayerError = (event) => {
    console.error('YT Player error:', event.data);
    // Auto-skip to next track on error
    setTimeout(() => handleNext(), 1000);
  };

  const startTimeUpdate = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (e) {
          console.error('Error getting current time:', e);
        }
      }
    }, 1000);
  };

  const handlePlaylistSelect = (playlist) => {
    setCurrentPlaylist(playlist);
    setCurrentTrackIndex(0);
    setSelectedUserPlaylist(null);
  };

  const handleUserPlaylistSelect = (playlistIndex) => {
    const playlist = userPlaylists[playlistIndex];
    setCurrentPlaylist(playlist);
    setCurrentTrackIndex(0);
    setSelectedUserPlaylist(playlistIndex);
  };

  const handlePlayPause = () => {
    if (!playerRef.current) {
      console.error('YT player not initialized');
      return;
    }

    if (!ytReady) {
      console.warn('YT player not ready yet');
      return;
    }

    try {
      if (typeof playerRef.current.pauseVideo !== 'function') {
        console.error('pauseVideo is not a function - player not properly initialized');
        return;
      }

      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (e) {
      console.error('Error in play/pause:', e);
    }
  };

  const handleNext = () => {
    if (currentPlaylist) {
      const nextIndex = (currentTrackIndex + 1) % currentPlaylist.videos.length;
      setCurrentTrackIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentPlaylist) {
      const prevIndex = currentTrackIndex === 0 ? currentPlaylist.videos.length - 1 : currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
    }
  };

  const handleSkipForward = () => {
    if (!playerRef.current || !ytReady) {
      console.warn('YT player not ready');
      return;
    }

    try {
      if (typeof playerRef.current.seekTo !== 'function') {
        console.error('seekTo is not a function');
        return;
      }

      const newTime = Math.min(currentTime + 10, duration);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    } catch (e) {
      console.error('Error in skip forward:', e);
    }
  };

  const handleSkipBackward = () => {
    if (!playerRef.current || !ytReady) {
      console.warn('YT player not ready');
      return;
    }

    try {
      if (typeof playerRef.current.seekTo !== 'function') {
        console.error('seekTo is not a function');
        return;
      }

      const newTime = Math.max(currentTime - 10, 0);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    } catch (e) {
      console.error('Error in skip backward:', e);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    
    if (playerRef.current && ytReady && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(newVolume);
      } catch (e) {
        console.error('Error setting volume:', e);
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    if (playerRef.current && ytReady && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(newTime, true);
      } catch (e) {
        console.error('Error seeking:', e);
      }
    }
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    return match ? match[1] : null;
  };

  const handleAddSongToPlaylist = () => {
    const videoId = extractVideoId(newSongUrl);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    if (selectedUserPlaylist !== null) {
      const updated = [...userPlaylists];
      updated[selectedUserPlaylist].videos.push({
        id: videoId,
        title: `Song ${updated[selectedUserPlaylist].videos.length + 1}`
      });
      setUserPlaylists(updated);
      setNewSongUrl('');
      setShowAddSong(false);
    }
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    
    const videoId = extractVideoId(newSongUrl);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    const newPlaylist = {
      id: `custom-${Date.now()}`,
      name: newPlaylistName,
      videos: [{ id: videoId, title: 'Song 1' }]
    };

    setUserPlaylists([...userPlaylists, newPlaylist]);
    setNewPlaylistName('');
    setNewSongUrl('');
    setShowCreatePlaylist(false);
  };

  const handleDeleteSong = (songIndex) => {
    if (selectedUserPlaylist !== null) {
      const updated = [...userPlaylists];
      updated[selectedUserPlaylist].videos.splice(songIndex, 1);
      setUserPlaylists(updated);
      
      if (currentTrackIndex >= updated[selectedUserPlaylist].videos.length) {
        setCurrentTrackIndex(0);
      }
    }
  };

  const handleMoveSong = (songIndex, direction) => {
    if (selectedUserPlaylist !== null) {
      const updated = [...userPlaylists];
      const playlist = updated[selectedUserPlaylist];
      const newIndex = direction === 'up' ? songIndex - 1 : songIndex + 1;
      
      if (newIndex >= 0 && newIndex < playlist.videos.length) {
        [playlist.videos[songIndex], playlist.videos[newIndex]] = 
        [playlist.videos[newIndex], playlist.videos[songIndex]];
        setUserPlaylists(updated);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTrack = () => {
    if (!currentPlaylist) return null;
    return currentPlaylist.videos[currentTrackIndex];
  };

  return (
    <div className="music-player-container">
      <div className="music-player-card">
        <h3 className="player-title">🎵 Calm Focus Music</h3>
        
        {/* Curated Playlists */}
        <div className="playlists-section">
          <div className="playlist-buttons">
            {CALM_PLAYLISTS.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handlePlaylistSelect(playlist)}
                className={`playlist-btn ${currentPlaylist?.id === playlist.id ? 'active' : ''}`}
              >
                {playlist.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Track Display */}
        {currentPlaylist && (
          <>
            <div id="youtube-player" style={{ display: 'none' }}></div>
            
            <div className="current-track">
              <div className="track-name">{getCurrentTrack()?.title || 'Loading...'}</div>
              <div className="track-playlist">{currentPlaylist.name}</div>
            </div>

            {/* Seek Bar */}
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

            {/* Playback Controls */}
            <div className="controls-section">
              <button onClick={handleSkipBackward} className="control-btn-icon" title="-10s">⏪</button>
              <button onClick={handlePrevious} className="control-btn-icon" title="Previous">⏮️</button>
              <button onClick={handlePlayPause} className="control-btn-main" title={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button onClick={handleNext} className="control-btn-icon" title="Next">⏭️</button>
              <button onClick={handleSkipForward} className="control-btn-icon" title="+10s">⏩</button>
            </div>

            {/* Volume */}
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

        {/* User Playlists Section */}
        <div className="user-playlists-section">
          <div className="section-header">
            <h4>📁 Your Music</h4>
            <button onClick={() => setShowCreatePlaylist(!showCreatePlaylist)} className="create-btn">
              + New Playlist
            </button>
          </div>

          {showCreatePlaylist && (
            <div className="create-playlist-form">
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="First YouTube URL"
                value={newSongUrl}
                onChange={(e) => setNewSongUrl(e.target.value)}
                className="input-field"
              />
              <button onClick={handleCreatePlaylist} className="save-btn">Create</button>
            </div>
          )}

          {userPlaylists.map((playlist, idx) => (
            <div key={playlist.id} className="user-playlist-item">
              <div className="playlist-header">
                <button
                  onClick={() => handleUserPlaylistSelect(idx)}
                  className={`user-playlist-btn ${selectedUserPlaylist === idx ? 'active' : ''}`}
                >
                  {playlist.name} ({playlist.videos.length})
                </button>
                {selectedUserPlaylist === idx && (
                  <button onClick={() => setShowAddSong(!showAddSong)} className="add-song-btn">
                    + Add Song
                  </button>
                )}
              </div>

              {selectedUserPlaylist === idx && showAddSong && (
                <div className="add-song-form">
                  <input
                    type="text"
                    placeholder="YouTube URL"
                    value={newSongUrl}
                    onChange={(e) => setNewSongUrl(e.target.value)}
                    className="input-field"
                  />
                  <button onClick={handleAddSongToPlaylist} className="save-btn">Add</button>
                </div>
              )}

              {selectedUserPlaylist === idx && (
                <div className="playlist-songs">
                  {playlist.videos.map((song, songIdx) => (
                    <div key={songIdx} className="song-item">
                      <span className="song-title">{song.title}</span>
                      <div className="song-actions">
                        <button onClick={() => handleMoveSong(songIdx, 'up')} disabled={songIdx === 0} className="move-btn">↑</button>
                        <button onClick={() => handleMoveSong(songIdx, 'down')} disabled={songIdx === playlist.videos.length - 1} className="move-btn">↓</button>
                        <button onClick={() => handleDeleteSong(songIdx)} className="delete-btn">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
