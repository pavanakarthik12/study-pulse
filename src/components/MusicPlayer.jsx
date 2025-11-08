import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Plus, List, X, FolderPlus, Radio } from 'lucide-react';

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
  const audioRef = useRef(null);

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
    }
  ]);

  const currentPlaylist = playlists[currentPlaylistIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentPlaylist.songs[currentTrack]) {
      audioRef.current.src = currentPlaylist.songs[currentTrack].url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack, currentPlaylistIndex]);

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

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % currentPlaylist.songs.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + currentPlaylist.songs.length) % currentPlaylist.songs.length);
  };

  const addSong = () => {
    if (newSongTitle && newSongUrl) {
      const updatedPlaylists = [...playlists];
      updatedPlaylists[currentPlaylistIndex].songs.push({
        title: newSongTitle,
        artist: "Custom Track",
        url: newSongUrl
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
    setCurrentTrack(index);
    setShowPlaylistModal(false);
    if (!isPlaying) {
      setIsPlaying(true);
      setTimeout(() => audioRef.current.play(), 100);
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
      minHeight: 'auto'
    }}>
      <audio ref={audioRef} onEnded={nextTrack} />
      
      <div style={{
        maxWidth: '1200px',
        width: '1200px',
        padding: '24px',
        borderRadius: '225px',
        background: '#000',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: '-apple-system, system-ui, sans-serif',
        color: 'white',
        transition: 'all 0.3s ease'
      }}>
        
        {/* Track Info Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Album Art */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
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
              fontSize: '1.3em',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}>{currentPlaylist.songs[currentTrack]?.title || 'No Track'}</div>
            <div style={{
              fontSize: '0.9em',
              color: '#d1d1d6',
              marginTop: '2px'
            }}>{currentPlaylist.songs[currentTrack]?.artist || 'Unknown Artist'}</div>
          </div>
          
          {/* Volume Bars */}
          <div className="volume-bars">
            {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].map((delay, i) => (
              <div key={i} className="bar" style={{ '--delay': `${delay}s` }} />
            ))}
          </div>
        </div>

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
            fontSize: '0.8em',
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
              height: '4px',
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
              width: '10px',
              height: '10px',
              backgroundColor: 'white',
              borderRadius: '50%',
              boxShadow: '0 0 6px rgba(0, 0, 0, 0.5)'
            }} />
          </div>
          
          {/* Button Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* Main Control Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginLeft: '10%'
            }}>
              <button
                onClick={prevTrack}
                style={{
                  width: '42px',
                  height: '42px',
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
                <SkipBack style={{ width: '22px', height: '22px' }} fill="currentColor" />
              </button>
              
              <button
                onClick={togglePlay}
                style={{
                  width: '52px',
                  height: '52px',
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
                  <Pause style={{ width: '30px', height: '30px' }} fill="currentColor" />
                ) : (
                  <Play style={{ width: '30px', height: '30px' }} fill="currentColor" />
                )}
              </button>
              
              <button
                onClick={nextTrack}
                style={{
                  width: '42px',
                  height: '42px',
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
                <SkipForward style={{ width: '22px', height: '22px' }} fill="currentColor" />
              </button>
            </div>
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={() => setShowPlaylistModal(true)}
                style={{
                  width: '42px',
                  height: '42px',
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
                <List style={{ width: '20px', height: '20px' }} />
              </button>
              
              <button
                onClick={() => setShowCreatePlaylistModal(true)}
                style={{
                  width: '42px',
                  height: '42px',
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
                <FolderPlus style={{ width: '20px', height: '20px' }} />
              </button>
              
              <button
                onClick={() => setShowAddSongModal(true)}
                style={{
                  width: '42px',
                  height: '42px',
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
                <Plus style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'white',
                fontFamily: '-apple-system, system-ui, sans-serif'
              }}>Playlists & Songs</h3>
              <button
                onClick={() => setShowPlaylistModal(false)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
              </button>
            </div>
            
            {/* Playlists */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#d1d1d6',
                marginBottom: '0.5rem',
                fontFamily: '-apple-system, system-ui, sans-serif'
              }}>Playlists</h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {playlists.map((playlist, index) => (
                  <button
                    key={index}
                    onClick={() => switchPlaylist(index)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      border: 'none',
                      background: currentPlaylistIndex === index
                        ? 'rgba(0, 198, 255, 0.3)'
                        : 'rgba(255, 255, 255, 0.05)',
                      fontFamily: '-apple-system, system-ui, sans-serif'
                    }}
                  >
                    <div style={{
                      fontWeight: '600',
                      color: 'white',
                      fontSize: '0.9rem'
                    }}>{playlist.name} ({playlist.songs.length})</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Songs in Current Playlist */}
            <div>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#d1d1d6',
                marginBottom: '0.5rem',
                fontFamily: '-apple-system, system-ui, sans-serif'
              }}>Songs in {currentPlaylist.name}</h4>
              <div style={{
                maxHeight: '15rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {currentPlaylist.songs.length === 0 ? (
                  <div style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#8e8e93',
                    fontSize: '0.875rem',
                    fontFamily: '-apple-system, system-ui, sans-serif'
                  }}>No songs in this playlist</div>
                ) : (
                  currentPlaylist.songs.map((track, index) => (
                    <button
                      key={index}
                      onClick={() => selectTrack(index)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        border: 'none',
                        background: currentTrack === index
                          ? 'rgba(0, 198, 255, 0.3)'
                          : 'rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{
                        fontWeight: '600',
                        color: 'white',
                        fontSize: '0.9rem',
                        fontFamily: '-apple-system, system-ui, sans-serif'
                      }}>{track.title}</div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#d1d1d6',
                        marginTop: '0.25rem',
                        fontFamily: '-apple-system, system-ui, sans-serif'
                      }}>{track.artist}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Song Modal */}
      {showAddSongModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'white',
                fontFamily: '-apple-system, system-ui, sans-serif'
              }}>Add Song to {currentPlaylist.name}</h3>
              <button
                onClick={() => setShowAddSongModal(false)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#d1d1d6',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  fontFamily: '-apple-system, system-ui, sans-serif'
                }}>Song Title</label>
                <input
                  type="text"
                  value={newSongTitle}
                  onChange={(e) => setNewSongTitle(e.target.value)}
                  placeholder="Enter song title"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    outline: 'none',
                    fontFamily: '-apple-system, system-ui, sans-serif'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  color: '#d1d1d6',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  fontFamily: '-apple-system, system-ui, sans-serif'
                }}>Audio URL</label>
                <input
                  type="text"
                  value={newSongUrl}
                  onChange={(e) => setNewSongUrl(e.target.value)}
                  placeholder="Enter MP3 URL"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    outline: 'none',
                    fontFamily: '-apple-system, system-ui, sans-serif'
                  }}
                />
              </div>
              <button
                onClick={addSong}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontFamily: '-apple-system, system-ui, sans-serif'
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
          <div className="modal-content">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'white',
                fontFamily: '-apple-system, system-ui, sans-serif'
              }}>Create New Playlist</h3>
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#d1d1d6',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  fontFamily: '-apple-system, system-ui, sans-serif'
                }}>Playlist Name</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    outline: 'none',
                    fontFamily: '-apple-system, system-ui, sans-serif'
                  }}
                />
              </div>
              <button
                onClick={createPlaylist}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontFamily: '-apple-system, system-ui, sans-serif'
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
          0%, 100% { height: 6px; }
          50% { height: 26px; }
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
          gap: 2px;
          width: 38px;
          height: 32px;
        }
        
        .volume-bars .bar {
          width: 3px;
          background: linear-gradient(180deg, #00c6ff, #0072ff);
          border-radius: 2px;
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
          borderRadius: 20px;
          padding: 1.5rem;
          maxWidth: 450px;
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