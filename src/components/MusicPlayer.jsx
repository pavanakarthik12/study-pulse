import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Plus, List, X } from 'lucide-react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongUrl, setNewSongUrl] = useState('');
  const audioRef = useRef(null);

  const [playlist, setPlaylist] = useState([
    {
      title: "Lofi Study Beats",
      artist: "Chill Vibes",
      url: "https://www.bensound.com/bensound-music/bensound-slowmotion.mp3",
      color: "#8B5CF6"
    },
    {
      title: "Peaceful Piano",
      artist: "Relaxing Melodies",
      url: "https://www.bensound.com/bensound-music/bensound-dreams.mp3",
      color: "#EC4899"
    },
    {
      title: "Ambient Waves",
      artist: "Nature Sounds",
      url: "https://www.bensound.com/bensound-music/bensound-relaxing.mp3",
      color: "#06B6D4"
    },
    {
      title: "Midnight Jazz",
      artist: "Smooth Sessions",
      url: "https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3",
      color: "#F59E0B"
    }
  ]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = playlist[currentTrack].url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const addSong = () => {
    if (newSongTitle && newSongUrl) {
      const colors = ["#8B5CF6", "#EC4899", "#06B6D4", "#F59E0B", "#10B981", "#EF4444"];
      setPlaylist([...playlist, {
        title: newSongTitle,
        artist: "Custom Track",
        url: newSongUrl,
        color: colors[Math.floor(Math.random() * colors.length)]
      }]);
      setNewSongTitle('');
      setNewSongUrl('');
      setShowAddSongModal(false);
    }
  };

  const selectTrack = (index) => {
    setCurrentTrack(index);
    setShowPlaylistModal(false);
    if (!isPlaying) {
      setIsPlaying(true);
      setTimeout(() => audioRef.current.play(), 100);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <audio ref={audioRef} onEnded={nextTrack} />
      
      <div style={{ position: 'relative' }}>
        {/* Player Card */}
        <div style={{
          backdropFilter: 'blur(24px)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(124, 58, 237, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%)',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          width: '384px'
        }}>
          
          {/* Spinning Vinyl Record */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <div 
              style={{
                width: '256px',
                height: '256px',
                borderRadius: '50%',
                position: 'relative',
                transition: 'all 0.5s ease',
                animation: isPlaying ? 'spin 3s linear infinite' : 'none',
                background: `radial-gradient(circle at center, ${playlist[currentTrack].color}30 0%, ${playlist[currentTrack].color}50 25%, #1a1a1a 26%, #0a0a0a 100%)`,
                boxShadow: `0 8px 32px ${playlist[currentTrack].color}40`,
                animationDuration: '3s',
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite'
              }}
            >
              {/* Vinyl grooves */}
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '1px solid rgba(31, 41, 55, 0.4)',
                    margin: `${8 + i * 8}px`
                  }}
                />
              ))}
              
              {/* Center label */}
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  background: `linear-gradient(135deg, ${playlist[currentTrack].color}, ${playlist[currentTrack].color}cc)`
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'black',
                    borderRadius: '50%',
                    margin: '0 auto 4px'
                  }} />
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                    opacity: 0.8
                  }}>NOW</div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                    opacity: 0.8
                  }}>PLAYING</div>
                </div>
              </div>

              {/* Vinyl shine effect */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  opacity: 0.2,
                  background: 'linear-gradient(135deg, transparent 0%, white 50%, transparent 100%)'
                }}
              />
            </div>
          </div>

          {/* Track Info */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.25rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>{playlist[currentTrack].title}</h2>
            <p style={{ color: '#c084fc' }}>{playlist[currentTrack].artist}</p>
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={prevTrack}
              style={{
                padding: '0.75rem',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <SkipBack style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
            </button>
            
            <button
              onClick={togglePlay}
              style={{
                padding: '1.25rem',
                borderRadius: '50%',
                background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #7c3aed, #db2777)';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(90deg, #8b5cf6, #ec4899)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              {isPlaying ? (
                <Pause style={{ width: '1.75rem', height: '1.75rem', color: 'white' }} fill="white" />
              ) : (
                <Play style={{ width: '1.75rem', height: '1.75rem', color: 'white' }} fill="white" />
              )}
            </button>
            
            <button
              onClick={nextTrack}
              style={{
                padding: '0.75rem',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <SkipForward style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
            </button>
          </div>

          {/* Volume Control */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <Volume2 style={{ width: '1.25rem', height: '1.25rem', color: '#c084fc' }} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{
                flex: 1,
                height: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                appearance: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Playlist Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowPlaylistModal(true)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <List style={{ width: '1.25rem', height: '1.25rem' }} />
              <span>Playlist</span>
            </button>
            <button
              onClick={() => setShowAddSongModal(true)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
                borderRadius: '0.75rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(90deg, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4))';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(90deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
              <span>Add Song</span>
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #7e22ce)',
            borderRadius: '24px',
            padding: '1.5rem',
            maxWidth: '32rem',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white'
              }}>Playlist</h3>
              <button
                onClick={() => setShowPlaylistModal(false)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                <X style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </button>
            </div>
            <div style={{
              maxHeight: '24rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {playlist.map((track, index) => (
                <button
                  key={index}
                  onClick={() => selectTrack(index)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: 'none',
                    background: currentTrack === index
                      ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4))'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: currentTrack === index ? '1px solid rgba(192, 132, 252, 0.5)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (currentTrack !== index) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentTrack !== index) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                >
                  <div style={{
                    fontWeight: '600',
                    color: 'white'
                  }}>{track.title}</div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#c084fc'
                  }}>{track.artist}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Song Modal */}
      {showAddSongModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #7e22ce)',
            borderRadius: '24px',
            padding: '1.5rem',
            maxWidth: '32rem',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'white'
              }}>Add New Song</h3>
              <button
                onClick={() => setShowAddSongModal(false)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                <X style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#c084fc',
                  marginBottom: '0.5rem'
                }}>Song Title</label>
                <input
                  type="text"
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  placeholder="Enter song title"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    placeholderColor: 'rgba(192, 132, 252, 0.5)',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  color: '#c084fc',
                  marginBottom: '0.5rem'
                }}>Audio URL</label>
                <input
                  type="text"
                  value={newSongUrl}
                  onChange={(e) => setNewSongUrl(e.target.value)}
                  placeholder="Enter MP3 URL"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    placeholderColor: 'rgba(192, 132, 252, 0.5)',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                />
              </div>
              <button
                onClick={addSong}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(90deg, #7c3aed, #db2777)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(90deg, #8b5cf6, #ec4899)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Add to Playlist
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MusicPlayer;