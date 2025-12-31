// 🎵 MUSIC PLAYER SYSTEM
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Repeat, Shuffle } from 'lucide-react';

// MUSIC LIBRARY (embedded ambient tracks)
const MUSIC_LIBRARY = {
  lofi: [
    { id: 'lofi1', name: 'Peaceful Reading', genre: 'Lofi', mood: 'calm', url: 'https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3' },
    { id: 'lofi2', name: 'Study Flow', genre: 'Lofi', mood: 'focus', url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3' }
  ],
  ambient: [
    { id: 'ambient1', name: 'Forest Ambience', genre: 'Ambient', mood: 'nature', url: 'https://assets.mixkit.co/music/preview/mixkit-forest-treasure-138.mp3' },
    { id: 'ambient2', name: 'Ocean Waves', genre: 'Ambient', mood: 'relax', url: 'https://assets.mixkit.co/music/preview/mixkit-deep-urban-623.mp3' }
  ],
  classical: [
    { id: 'classical1', name: 'Piano Sonata', genre: 'Classical', mood: 'elegant', url: 'https://assets.mixkit.co/music/preview/mixkit-piano-reflections-14.mp3' }
  ]
};

export function MusicPlayer({ isReading = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [selectedMood, setSelectedMood] = useState('all');
  
  const audioRef = useRef(null);
  
  useEffect(() => {
    // Initialize with all tracks
    const allTracks = [...MUSIC_LIBRARY.lofi, ...MUSIC_LIBRARY.ambient, ...MUSIC_LIBRARY.classical];
    setPlaylist(allTracks);
    if (allTracks.length > 0) {
      setCurrentTrack(allTracks[0]);
    }
  }, []);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  useEffect(() => {
    // Auto-play when reading starts
    if (isReading && !isPlaying) {
      playTrack(currentTrack);
    }
  }, [isReading]);
  
  const playTrack = (track) => {
    if (!track) return;
    
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.play();
      setIsPlaying(true);
      setCurrentTrack(track);
    }
  };
  
  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const nextTrack = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    let nextIndex;
    
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
    playTrack(playlist[nextIndex]);
  };
  
  const prevTrack = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    playTrack(playlist[prevIndex]);
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const handleEnded = () => {
    if (repeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      nextTrack();
    }
  };
  
  const filterByMood = (mood) => {
    setSelectedMood(mood);
    if (mood === 'all') {
      const allTracks = [...MUSIC_LIBRARY.lofi, ...MUSIC_LIBRARY.ambient, ...MUSIC_LIBRARY.classical];
      setPlaylist(allTracks);
    } else {
      const filtered = [...MUSIC_LIBRARY.lofi, ...MUSIC_LIBRARY.ambient, ...MUSIC_LIBRARY.classical]
        .filter(track => track.mood === mood);
      setPlaylist(filtered);
      if (filtered.length > 0 && !filtered.find(t => t.id === currentTrack?.id)) {
        setCurrentTrack(filtered[0]);
      }
    }
  };
  
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="cozy-card" style={{ padding: 24 }}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Music size={24} style={{ color: 'var(--accent)' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Music Player</h3>
      </div>
      
      {/* Mood Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'calm', 'focus', 'nature', 'relax', 'elegant'].map(mood => (
          <button
            key={mood}
            onClick={() => filterByMood(mood)}
            className={`btn-ghost ${selectedMood === mood ? 'active' : ''}`}
            style={{ textTransform: 'capitalize', padding: '6px 16px' }}
          >
            {mood === 'all' ? '🎵 All' : mood}
          </button>
        ))}
      </div>
      
      {/* Current Track Info */}
      {currentTrack && (
        <div style={{
          padding: 20,
          background: 'var(--grad-main)',
          borderRadius: 12,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: 12 }}>🎵</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 4 }}>
            {currentTrack.name}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {currentTrack.genre}
          </div>
        </div>
      )}
      
      {/* Progress Bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: '100%',
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) 100%)`,
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.6, marginTop: 4 }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => setShuffle(!shuffle)}
          style={{
            background: 'none',
            border: 'none',
            color: shuffle ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            padding: 8
          }}
        >
          <Shuffle size={20} />
        </button>
        
        <button
          onClick={prevTrack}
          className="btn-ghost"
          style={{ width: 40, height: 40, borderRadius: '50%', padding: 0 }}
        >
          <SkipBack size={20} />
        </button>
        
        <button
          onClick={togglePlay}
          className="btn-main"
          style={{ width: 56, height: 56, borderRadius: '50%', padding: 0 }}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button
          onClick={nextTrack}
          className="btn-ghost"
          style={{ width: 40, height: 40, borderRadius: '50%', padding: 0 }}
        >
          <SkipForward size={20} />
        </button>
        
        <button
          onClick={() => setRepeat(!repeat)}
          style={{
            background: 'none',
            border: 'none',
            color: repeat ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            padding: 8
          }}
        >
          <Repeat size={20} />
        </button>
      </div>
      
      {/* Volume Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 0 }}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <span style={{ fontSize: '12px', opacity: 0.6, minWidth: 35 }}>
          {Math.round(volume * 100)}%
        </span>
      </div>
      
      {/* Playlist */}
      <div style={{ marginTop: 20, maxHeight: 200, overflowY: 'auto' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: 12, opacity: 0.8 }}>
          Playlist ({playlist.length} tracks)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {playlist.map(track => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              style={{
                padding: 12,
                background: currentTrack?.id === track.id ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{track.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>{track.genre}</div>
              </div>
              {currentTrack?.id === track.id && isPlaying && (
                <div style={{ fontSize: '18px', animation: 'pulse 1.5s infinite' }}>🎵</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact version for sidebar
export function MusicPlayerCompact({ isReading }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  useEffect(() => {
    if (isReading && !isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  }, [isReading]);
  
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };
  
  return (
    <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
      <audio ref={audioRef} loop>
        <source src="https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3" type="audio/mpeg" />
      </audio>
      <button
        onClick={togglePlay}
        style={{
          width: '100%',
          background: isPlaying ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
          border: 'none',
          padding: 10,
          borderRadius: 8,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        {isPlaying ? 'Pause Music' : 'Play Music'}
      </button>
    </div>
  );
}

export default MusicPlayer;