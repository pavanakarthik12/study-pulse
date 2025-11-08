import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Plus, List, X, FolderPlus, Radio, Music } from 'lucide-react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongUrl, setNewSongUrl] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [youTubePlayer, setYouTubePlayer] = useState(null);
  const [youTubeReady, setYouTubeReady] = useState(false);
  const audioRef = useRef(null);
  const youTubeIframeRef = useRef(null);

  const [playlists, setPlaylists] = useState([
    {
      name: "Chill Vibes",
      songs: [
        {
          title: "Lofi Study Beats",
          artist: "Chill Vibes",
          url: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3"
        },
        {
          title: "Peaceful Piano",
          artist: "Relaxing Melodies",
          url: "https://www.bensound.com/bensound-music/bensound-dreams.mp3"
        }
      ]
    },
    {
      name: "Upbeat Mix",
      songs: [
        {
          title: "Ambient Waves",
          artist: "Nature Sounds",
          url: "https://www.bensound.com/bensound-music/bensound-relaxing.mp3"
        },
        {
          title: "Midnight Jazz",
          artist: "Smooth Sessions",
          url: "https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3"
        }
      ]
    },
    {
      name: "YouTube Examples",
      songs: [
        {
          title: "Lo-Fi Hip Hop",
          artist: "YouTube",
          url: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0&controls=1&disablekb=1&fs=0&loop=1&playlist=jfKfPfyJRdk&modestbranding=1",
          videoId: "jfKfPfyJRdk"
        },
        {
          title: "Deep Focus",
          artist: "YouTube",
          url: "https://www.youtube.com/embed/5qap5aO4i9A?autoplay=0&controls=1&disablekb=1&fs=0&loop=1&playlist=5qap5aO4i9A&modestbranding=1",
          videoId: "5qap5aO4i9A"
        }
      ]
    }
  ]);

  const currentPlaylist = playlists[currentPlaylistIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    
    // Also set YouTube player volume if ready
    if (youTubePlayer && youTubeReady) {
      try {
        youTubePlayer.setVolume(volume * 100);
      } catch (error) {
        console.error('Error setting YouTube volume:', error);
      }
    }
  }, [volume, youTubePlayer, youTubeReady]);

  useEffect(() => {
    if (audioRef.current && currentPlaylist.songs[currentTrack]) {
      const currentSong = currentPlaylist.songs[currentTrack];
      
      // Check if it's a YouTube video
      if (currentSong.videoId) {
        // For YouTube, load the video in the YouTube player
        if (youTubePlayer && youTubeReady) {
          try {
            youTubePlayer.loadVideoById(currentSong.videoId);
            youTubePlayer.setVolume(volume * 100);
            // Pause initially until user presses play
            youTubePlayer.pauseVideo();
          } catch (error) {
            console.error('Error loading YouTube video:', error);
          }
        }
        setIsPlaying(false); // Reset playing state for YouTube
      } else {
        audioRef.current.src = currentSong.url;
        if (isPlaying) {
          audioRef.current.play();
        }
      }
    }
  }, [currentTrack, currentPlaylistIndex, youTubePlayer, youTubeReady, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  // Initialize YouTube IFrame API
  useEffect(() => {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      initializeYouTubePlayer();
    } else {
      // Create script tag to load YouTube IFrame API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      // Set up global callback
      window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
    }
    
    // Cleanup function
    return () => {
      if (youTubePlayer) {
        try {
          youTubePlayer.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
      
      // Remove the player div
      const playerDiv = document.getElementById('youtube-audio-player');
      if (playerDiv) {
        playerDiv.remove();
      }
    };
  }, []);

  const initializeYouTubePlayer = () => {
    // Create a hidden div for the YouTube player
    const playerDiv = document.createElement('div');
    playerDiv.id = 'youtube-audio-player';
    playerDiv.style.position = 'absolute';
    playerDiv.style.left = '-9999px';
    playerDiv.style.width = '0';
    playerDiv.style.height = '0';
    document.body.appendChild(playerDiv);
    
    try {
      // Initialize YouTube player
      const player = new window.YT.Player('youtube-audio-player', {
        height: '0',
        width: '0',
        videoId: '',
        playerVars: {
          'autoplay': 0,
          'controls': 0,
          'disablekb': 1,
          'fs': 0,
          'loop': 1,
          'modestbranding': 1,
          'iv_load_policy': 3,
          'cc_load_policy': 0,
          'disable_polymer': 1
        },
        events: {
          'onReady': () => {
            setYouTubePlayer(player);
            setYouTubeReady(true);
          },
          'onStateChange': onYouTubePlayerStateChange
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  };

  const onYouTubePlayerStateChange = (event) => {
    // Handle state changes
    if (event.data === window.YT.PlayerState.ENDED) {
      nextTrack();
    }
  };

  const togglePlay = () => {
    const currentSong = currentPlaylist.songs[currentTrack];
    
    // Check if it's a YouTube video
    if (currentSong && currentSong.videoId) {
      // For YouTube videos, use the YouTube player
      if (youTubePlayer && youTubeReady) {
        try {
          if (isPlaying) {
            youTubePlayer.pauseVideo();
          } else {
            youTubePlayer.playVideo();
          }
          setIsPlaying(!isPlaying);
        } catch (error) {
          console.error('Error controlling YouTube player:', error);
        }
      }
    } else {
      // For regular audio files
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    // Stop current YouTube video if playing
    if (youTubePlayer && youTubeReady && currentPlaylist.songs[currentTrack]?.videoId) {
      try {
        youTubePlayer.stopVideo();
      } catch (error) {
        console.error('Error stopping YouTube video:', error);
      }
    }
    
    setCurrentTrack((prev) => (prev + 1) % currentPlaylist.songs.length);
    setIsPlaying(false);
  };

  const prevTrack = () => {
    // Stop current YouTube video if playing
    if (youTubePlayer && youTubeReady && currentPlaylist.songs[currentTrack]?.videoId) {
      try {
        youTubePlayer.stopVideo();
      } catch (error) {
        console.error('Error stopping YouTube video:', error);
      }
    }
    
    setCurrentTrack((prev) => (prev - 1 + currentPlaylist.songs.length) % currentPlaylist.songs.length);
    setIsPlaying(false);
  };

  const addSong = () => {
    if (newSongTitle && newSongUrl) {
      // Check if it's a YouTube URL and extract the video ID
      let finalUrl = newSongUrl;
      let videoId = null;
      
      // Parse YouTube URL to extract video ID
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = newSongUrl.match(youtubeRegex);
      
      if (match && match[1]) {
        videoId = match[1];
        // Create YouTube embed URL optimized for audio-only playback
        finalUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&disablekb=1&fs=0&loop=1&playlist=${videoId}&modestbranding=1&iv_load_policy=3&cc_load_policy=0&disable_polymer=1`;
      }
      
      const updatedPlaylists = [...playlists];
      updatedPlaylists[currentPlaylistIndex].songs.push({
        title: newSongTitle,
        artist: videoId ? "YouTube Audio" : "Custom Track",
        url: finalUrl,
        videoId: videoId // Store video ID for reference
      });
      setPlaylists(updatedPlaylists);
      setNewSongTitle('');
      setNewSongUrl('');
      setShowAddSongModal(false);
    }
  };

  const createPlaylist = () => {
    if (newPlaylistName) {
      setPlaylists([...playlists, {
        name: newPlaylistName,
        songs: []
      }]);
      setNewPlaylistName('');
      setShowCreatePlaylistModal(false);
    }
  };

  const selectTrack = (index) => {
    // Stop current YouTube video if playing
    if (youTubePlayer && youTubeReady && currentPlaylist.songs[currentTrack]?.videoId) {
      try {
        youTubePlayer.stopVideo();
      } catch (error) {
        console.error('Error stopping YouTube video:', error);
      }
    }
    
    setCurrentTrack(index);
    setShowPlaylistModal(false);
    
    const selectedSong = currentPlaylist.songs[index];
    
    // Check if it's a YouTube video
    if (selectedSong && selectedSong.videoId) {
      // For YouTube videos, load the video
      if (youTubePlayer && youTubeReady) {
        try {
          youTubePlayer.loadVideoById(selectedSong.videoId);
          youTubePlayer.setVolume(volume * 100);
        } catch (error) {
          console.error('Error loading YouTube video:', error);
        }
      }
      setIsPlaying(false); // Reset playing state for YouTube
    } else {
      // For regular audio files
      if (!isPlaying) {
        setIsPlaying(true);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
          }
        }, 100);
      }
    }
  };

  const switchPlaylist = (index) => {
    setCurrentPlaylistIndex(index);
    setCurrentTrack(0);
    setShowPlaylistModal(false);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  return (
    <div style={{
      padding: 20,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'auto',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <audio ref={audioRef} onEnded={nextTrack} />
      
      <div style={{
        maxWidth: '350px',
        width: '350px',
        padding: '20px',
        borderRadius: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        fontFamily: "'Outfit', sans-serif",
        color: 'white',
        transition: 'all 0.3s ease',
        transform: 'scale(1)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
      }}
      >
        {/* Track Info Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {/* Album Art */}
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
            boxShadow: '0 4px 10px rgba(124, 58, 237, 0.5)',
            flexShrink: 0,
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          
          {/* Track Details */}
          <div style={{
            flexGrow: 1,
            overflow: 'hidden'
          }}>
            <div style={{
              fontSize: '1em',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}>{currentPlaylist.songs[currentTrack]?.title || 'No Track'}</div>
            <div style={{
              fontSize: '0.8em',
              color: '#d1d1d6',
              marginTop: '2px'
            }}>
              {currentPlaylist.songs[currentTrack]?.artist || 'Unknown Artist'} 
              {currentPlaylist.songs[currentTrack]?.videoId ? ' (YouTube)' : ''}
            </div>
          </div>
          
          {/* Volume Bars */}
          <div className="volume-bars">
            {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].map((delay, i) => (
              <div key={i} className="bar" style={{ '--delay': `${delay}s` }} />
            ))}
          </div>
        </div>

        {/* YouTube Audio Player (hidden video) */}
        {currentPlaylist.songs[currentTrack]?.videoId && (
          <div style={{
            width: '100%',
            height: '60px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d1d1d6',
            fontSize: '0.9em'
          }}>
            <Music style={{ marginRight: '8px' }} size={16} />
            YouTube Audio: {currentPlaylist.songs[currentTrack]?.title}
          </div>
        )}

        {/* Playback Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Time Info */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.7em',
            color: '#8e8e93'
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration - currentTime)}</span>
          </div>
          
          {/* Progress Bar */}
          <div 
            onClick={handleProgressClick}
            style={{
              width: '100%',
              height: '3px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              position: 'relative',
              overflow: 'visible',
              cursor: 'pointer'
            }}>
            <div style={{
              height: '100%',
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
              borderRadius: '2px',
              transition: 'width 0.1s linear'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${duration ? (currentTime / duration) * 100 : 0}%`,
              transform: 'translate(-50%, -50%)',
              width: '8px',
              height: '8px',
              backgroundColor: 'white',
              borderRadius: '50%',
              boxShadow: '0 0 6px rgba(0, 0, 0, 0.5)'
            }} />
          </div>
          
          {/* Button Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '8px',
            alignItems: 'center'
          }}>
            {/* Main Control Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginLeft: '5%'
            }}>
              <button
                onClick={prevTrack}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.2s',
                  color: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <SkipBack style={{ width: '18px', height: '18px' }} fill="currentColor" />
              </button>
              
              <button
                onClick={togglePlay}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.2s',
                  color: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isPlaying ? (
                  <Pause style={{ width: '24px', height: '24px' }} fill="currentColor" />
                ) : (
                  <Play style={{ width: '24px', height: '24px' }} fill="currentColor" />
                )}
              </button>
              
              <button
                onClick={nextTrack}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.2s',
                  color: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <SkipForward style={{ width: '18px', height: '18px' }} fill="currentColor" />
              </button>
            </div>
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '6px'
            }}>
              <button
                onClick={() => setShowPlaylistModal(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.2s',
                  color: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <List style={{ width: '16px', height: '16px' }} />
              </button>
              
              <button
                onClick={() => setShowCreatePlaylistModal(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.2s',
                  color: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <FolderPlus style={{ width: '16px', height: '16px' }} />
              </button>
              
              <button
                onClick={() => setShowAddSongModal(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.2s',
                  color: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{
            maxHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '250px',
            padding: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
              padding: '0 0.1rem'
            }}>
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'white',
                fontFamily: '-apple-system, system-ui, sans-serif',
                margin: 0
              }}>Playlists</h3>
              <button
                onClick={() => setShowPlaylistModal(false)}
                style={{
                  padding: '0.3rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                <X style={{ width: '0.9rem', height: '0.9rem', color: 'white' }} />
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flex: 1,
              overflow: 'hidden'
            }}>
              {/* Playlists Section */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                minWidth: '80px'
              }}>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  padding: '0.1rem'
                }}>
                  {playlists.map((playlist, index) => (
                    <button
                      key={index}
                      onClick={() => switchPlaylist(index)}
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        borderRadius: '8px',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        border: 'none',
                        background: currentPlaylistIndex === index
                          ? 'rgba(0, 198, 255, 0.3)'
                          : 'rgba(255, 255, 255, 0.05)',
                        fontFamily: '-apple-system, system-ui, sans-serif',
                        fontSize: '0.7rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = currentPlaylistIndex === index
                          ? 'rgba(0, 198, 255, 0.4)'
                          : 'rgba(255, 255, 255, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = currentPlaylistIndex === index
                          ? 'rgba(0, 198, 255, 0.3)'
                          : 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <div style={{
                        fontWeight: '600',
                        color: 'white',
                        fontSize: '0.7rem'
                      }}>{playlist.name}</div>
                      <div style={{
                        fontSize: '0.55rem',
                        color: '#a0a0a0',
                        marginTop: '0.05rem'
                      }}>{playlist.songs.length} songs</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Songs in Current Playlist */}
              <div style={{
                flex: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0 0.1rem'
                }}>
                  <h4 style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    color: '#d1d1d6',
                    margin: 0,
                    fontFamily: '-apple-system, system-ui, sans-serif'
                  }}>Songs</h4>
                  <button
                    onClick={() => setShowAddSongModal(true)}
                    style={{
                      padding: '0.2rem 0.4rem',
                      borderRadius: '5px',
                      background: 'rgba(0, 198, 255, 0.2)',
                      color: '#00c6ff',
                      border: '1px solid rgba(0, 198, 255, 0.3)',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      fontFamily: '-apple-system, system-ui, sans-serif',
                      fontSize: '0.55rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 198, 255, 0.3)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 198, 255, 0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Plus style={{ width: '0.5rem', height: '0.5rem', display: 'inline', marginRight: '0.1rem' }} />
                    Add
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  padding: '0.1rem'
                }}>
                  {currentPlaylist.songs.length === 0 ? (
                    <div style={{
                      padding: '0.5rem',
                      textAlign: 'center',
                      color: '#8e8e93',
                      fontSize: '0.6rem',
                      fontFamily: '-apple-system, system-ui, sans-serif'
                    }}>
                      <Music style={{ width: '1.2rem', height: '1.2rem', margin: '0 auto 0.3rem', color: '#444' }} />
                      <div>No songs</div>
                      <button
                        onClick={() => setShowAddSongModal(true)}
                        style={{
                          marginTop: '0.3rem',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '5px',
                          background: 'rgba(0, 198, 255, 0.2)',
                          color: '#00c6ff',
                          border: '1px solid rgba(0, 198, 255, 0.3)',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          fontFamily: '-apple-system, system-ui, sans-serif',
                          fontSize: '0.55rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 198, 255, 0.3)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 198, 255, 0.2)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Add Song
                      </button>
                    </div>
                  ) : (
                    currentPlaylist.songs.map((track, index) => (
                      <button
                        key={index}
                        onClick={() => selectTrack(index)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '10px',
                          textAlign: 'left',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          border: 'none',
                          background: currentTrack === index
                            ? 'rgba(0, 198, 255, 0.3)'
                            : 'rgba(255, 255, 255, 0.05)',
                          fontSize: '0.75rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = currentTrack === index
                            ? 'rgba(0, 198, 255, 0.4)'
                            : 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = currentTrack === index
                            ? 'rgba(0, 198, 255, 0.3)'
                            : 'rgba(255, 255, 255, 0.05)';
                        }}
                      >
                        <div style={{
                          fontWeight: '600',
                          color: 'white',
                          fontSize: '0.75rem'
                        }}>{track.title}</div>
                        <div style={{
                          fontSize: '0.6rem',
                          color: '#d1d1d6',
                          marginTop: '0.1rem',
                          fontFamily: '-apple-system, system-ui, sans-serif'
                        }}>
                          {track.artist} {track.videoId ? '(YouTube)' : ''}
                        </div>
                      </button>

                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Create Playlist Button */}
            <div style={{
              padding: '0.3rem 0 0',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <button
                onClick={() => setShowCreatePlaylistModal(true)}
                style={{
                  width: '100%',
                  padding: '0.4rem',
                  borderRadius: '8px',
                  background: 'rgba(124, 58, 237, 0.2)',
                  color: '#a78bfa',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  fontFamily: '-apple-system, system-ui, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(124, 58, 237, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <FolderPlus style={{ width: '0.7rem', height: '0.7rem', display: 'inline', marginRight: '0.3rem' }} />
                New Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Song Modal */}
      {showAddSongModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{
            maxWidth: '220px',
            padding: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'white',
                fontFamily: '-apple-system, system-ui, sans-serif',
                margin: 0
              }}>Add Song</h3>
              <button
                onClick={() => setShowAddSongModal(false)}
                style={{
                  padding: '0.3rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                <X style={{ width: '0.9rem', height: '0.9rem', color: 'white' }} />
              </button>
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem' 
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#d1d1d6',
                  marginBottom: '0.3rem',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  fontFamily: '-apple-system, system-ui, sans-serif'
                }}>Title</label>
                <input
                  type="text"
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  placeholder="Title"
                  style={{
                    width: '100%',
                    padding: '0.4rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '0.65rem',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(0, 198, 255, 0.5)';
                    e.target.style.boxShadow = '0 0 0 1px rgba(0, 198, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  color: '#d1d1d6',
                  marginBottom: '0.3rem',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  fontFamily: '-apple-system, system-ui, sans-serif'
                }}>URL</label>
                <input
                  type="text"
                  value={newSongUrl}
                  onChange={(e) => setNewSongUrl(e.target.value)}
                  placeholder="MP3 URL"
                  style={{
                    width: '100%',
                    padding: '0.4rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '0.65rem',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(0, 198, 255, 0.5)';
                    e.target.style.boxShadow = '0 0 0 1px rgba(0, 198, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <button
                onClick={addSong}
                style={{
                  width: '100%',
                  padding: '0.4rem',
                  background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: 'none',
                  fontSize: '0.65rem',
                  fontFamily: '-apple-system, system-ui, sans-serif',
                  boxShadow: '0 2px 10px rgba(0, 198, 255, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 198, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 198, 255, 0.4)';
                }}
              >
                Add to Playlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylistModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{
            maxWidth: '220px',
            padding: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'white',
                fontFamily: '-apple-system, system-ui, sans-serif',
                margin: 0
              }}>New Playlist</h3>
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                style={{
                  padding: '0.3rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                <X style={{ width: '0.9rem', height: '0.9rem', color: 'white' }} />
              </button>
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem' 
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#d1d1d6',
                  marginBottom: '0.3rem',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  fontFamily: '-apple-system, system-ui, sans-serif'
                }}>Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name"
                  style={{
                    width: '100%',
                    padding: '0.4rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    fontFamily: '-apple-system, system-ui, sans-serif',
                    fontSize: '0.65rem',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(124, 58, 237, 0.5)';
                    e.target.style.boxShadow = '0 0 0 1px rgba(124, 58, 237, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <button
                onClick={createPlaylist}
                style={{
                  width: '100%',
                  padding: '0.4rem',
                  background: 'linear-gradient(135deg, #7c3aed, #581c87)',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: 'none',
                  fontSize: '0.65rem',
                  fontFamily: '-apple-system, system-ui, sans-serif',
                  boxShadow: '0 2px 10px rgba(124, 58, 237, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(124, 58, 237, 0.4)';
                }}
              >
                Create Playlist
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes bounce {
          0%, 100% { height: 2px; }
          50% { height: 12px; }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .volume-bars {
          display: flex;
          align-items: flex-end;
          gap: 1px;
          width: 20px;
          height: 16px;
        }
        
        .volume-bars .bar {
          width: 1px;
          background: linear-gradient(180deg, #00c6ff, #0072ff);
          border-radius: 1px;
          animation: bounce 0.8s infinite ease-in-out;
          animation-delay: var(--delay);
          animation-play-state: ${isPlaying ? 'running' : 'paused'};
        }
        
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdropFilter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }
        
        .modal-content {
          background: #000;
          boxShadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6);
          borderRadius: 12px;
          padding: 0.5rem;
          maxWidth: 220px;
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: fadeIn 0.3s ease-out;
        }
        
        input::placeholder {
          color: rgba(209, 209, 214, 0.5);
        }
      `}</style>
    </div>
  );
};

export default MusicPlayer;