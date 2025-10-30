import React, { useState, useEffect, useRef } from "react";

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
    <div style={{
      margin: '20px auto',
      maxWidth: '450px',
      width: '100%'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(229, 231, 235, 0.8)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
      }}>
        <h3 style={{
          margin: '0 0 20px 0',
          fontSize: '20px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center'
        }}>🎵 Calm Focus Music</h3>
        
        {/* Curated Playlists */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {CALM_PLAYLISTS.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handlePlaylistSelect(playlist)}
                style={{
                  flex: '1',
                  minWidth: 'calc(50% - 4px)',
                  padding: '12px 16px',
                  background: currentPlaylist?.id === playlist.id 
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                    : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                  border: '2px solid transparent',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: currentPlaylist?.id === playlist.id ? 'white' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: currentPlaylist?.id === playlist.id 
                    ? '0 4px 16px rgba(99, 102, 241, 0.3)' 
                    : 'none',
                  transform: currentPlaylist?.id === playlist.id ? 'translateY(-2px)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (currentPlaylist?.id !== playlist.id) {
                    e.target.style.background = 'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPlaylist?.id !== playlist.id) {
                    e.target.style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                    e.target.style.transform = 'none';
                    e.target.style.boxShadow = 'none';
                  }
                }}
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
            
            <div style={{
              background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '16px',
              textAlign: 'center',
              border: '1px solid #e9d5ff',
              animation: 'fadeIn 0.5s ease-in'
            }}>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#4c1d95',
                marginBottom: '4px'
              }}>{getCurrentTrack()?.title || 'Loading...'}</div>
              <div style={{
                fontSize: '12px',
                color: '#7c3aed',
                opacity: '0.8'
              }}>{currentPlaylist.name}</div>
            </div>

            {/* Seek Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <span style={{
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: '600',
                minWidth: '38px',
                textAlign: 'center'
              }}>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  flex: '1',
                  height: '6px',
                  borderRadius: '3px',
                  background: '#e5e7eb',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: '600',
                minWidth: '38px',
                textAlign: 'center'
              }}>{formatTime(duration)}</span>
            </div>

            {/* Playback Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <button onClick={handleSkipBackward} title="-10s" style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#f3f4f6',
                color: '#6366f1',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e5e7eb';
                e.target.style.borderColor = '#6366f1';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.transform = 'scale(1)';
              }}
              >
                ⏪
              </button>
              <button onClick={handlePrevious} title="Previous" style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#f3f4f6',
                color: '#6366f1',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e5e7eb';
                e.target.style.borderColor = '#6366f1';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.transform = 'scale(1)';
              }}
              >
                ⏮️
              </button>
              <button onClick={handlePlayPause} title={isPlaying ? "Pause" : "Play"} style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                fontSize: '22px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.08)';
                e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)';
              }}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button onClick={handleNext} title="Next" style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#f3f4f6',
                color: '#6366f1',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e5e7eb';
                e.target.style.borderColor = '#6366f1';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.transform = 'scale(1)';
              }}
              >
                ⏭️
              </button>
              <button onClick={handleSkipForward} title="+10s" style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#f3f4f6',
                color: '#6366f1',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e5e7eb';
                e.target.style.borderColor = '#6366f1';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.transform = 'scale(1)';
              }}
              >
                ⏩
              </button>
            </div>

            {/* Volume */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(243, 244, 246, 0.6)',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '16px' }}>🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  flex: '1',
                  height: '4px',
                  borderRadius: '2px',
                  background: '#e5e7eb',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: '600',
                minWidth: '35px',
                textAlign: 'right'
              }}>{volume}%</span>
            </div>
          </>
        )}

        {/* User Playlists Section */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{
              margin: '0',
              fontSize: '16px',
              fontWeight: '700',
              color: '#374151'
            }}>📁 Your Music</h4>
            <button onClick={() => setShowCreatePlaylist(!showCreatePlaylist)} style={{
              padding: '6px 14px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            >
              + New Playlist
            </button>
          </div>

          {showCreatePlaylist && (
            <div style={{
              background: '#f9fafb',
              padding: '12px',
              borderRadius: '10px',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
              <input
                type="text"
                placeholder="First YouTube URL"
                value={newSongUrl}
                onChange={(e) => setNewSongUrl(e.target.value)}
                style={{
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
              <button onClick={handleCreatePlaylist} style={{
                padding: '8px 16px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#4f46e5';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#6366f1';
                e.target.style.transform = 'translateY(0)';
              }}
              >
                Create
              </button>
            </div>
          )}

          {userPlaylists.map((playlist, idx) => (
            <div key={playlist.id} style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px'
              }}>
                <button
                  onClick={() => handleUserPlaylistSelect(idx)}
                  style={{
                    flex: '1',
                    padding: '10px 14px',
                    background: selectedUserPlaylist === idx 
                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                      : '#f3f4f6',
                    border: '2px solid transparent',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: selectedUserPlaylist === idx ? 'white' : '#374151',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    borderColor: selectedUserPlaylist === idx ? '#10b981' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedUserPlaylist !== idx) {
                      e.target.style.background = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedUserPlaylist !== idx) {
                      e.target.style.background = '#f3f4f6';
                    }
                  }}
                >
                  {playlist.name} ({playlist.videos.length})
                </button>
                {selectedUserPlaylist === idx && (
                  <button onClick={() => setShowAddSong(!showAddSong)} style={{
                    padding: '8px 12px',
                    background: '#e5e7eb',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#e5e7eb';
                  }}
                  >
                    + Add Song
                  </button>
                )}
              </div>

              {selectedUserPlaylist === idx && showAddSong && (
                <div style={{
                  background: '#f9fafb',
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <input
                    type="text"
                    placeholder="YouTube URL"
                    value={newSongUrl}
                    onChange={(e) => setNewSongUrl(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6366f1';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                  />
                  <button onClick={handleAddSongToPlaylist} style={{
                    padding: '8px 16px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#4f46e5';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#6366f1';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  >
                    Add
                  </button>
                </div>
              )}

              {selectedUserPlaylist === idx && (
                <div style={{
                  marginTop: '10px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  padding: '8px'
                }}>
                  {playlist.videos.map((song, songIdx) => (
                    <div key={songIdx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      background: 'white',
                      borderRadius: '6px',
                      marginBottom: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.boxShadow = 'none';
                    }}
                    >
                      <span style={{
                        fontSize: '12px',
                        color: '#374151',
                        fontWeight: '500'
                      }}>{song.title}</span>
                      <div style={{
                        display: 'flex',
                        gap: '6px'
                      }}>
                        <button onClick={() => handleMoveSong(songIdx, 'up')} disabled={songIdx === 0} style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          cursor: songIdx === 0 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#e5e7eb',
                          color: '#374151',
                          opacity: songIdx === 0 ? '0.3' : '1'
                        }}
                        onMouseEnter={(e) => {
                          if (songIdx !== 0) {
                            e.target.style.background = '#d1d5db';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (songIdx !== 0) {
                            e.target.style.background = '#e5e7eb';
                          }
                        }}
                        >
                          ↑
                        </button>
                        <button onClick={() => handleMoveSong(songIdx, 'down')} disabled={songIdx === playlist.videos.length - 1} style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          cursor: songIdx === playlist.videos.length - 1 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#e5e7eb',
                          color: '#374151',
                          opacity: songIdx === playlist.videos.length - 1 ? '0.3' : '1'
                        }}
                        onMouseEnter={(e) => {
                          if (songIdx !== playlist.videos.length - 1) {
                            e.target.style.background = '#d1d5db';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (songIdx !== playlist.videos.length - 1) {
                            e.target.style.background = '#e5e7eb';
                          }
                        }}
                        >
                          ↓
                        </button>
                        <button onClick={() => handleDeleteSong(songIdx)} style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#fee2e2',
                          color: '#ef4444'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#fecaca';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#fee2e2';
                        }}
                        >
                          🗑️
                        </button>
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