// 🎵 ENHANCED MUSIC LIBRARY++
import { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Repeat, Shuffle, Heart, List, Radio } from 'lucide-react';

// EXPANDED MUSIC LIBRARY
const MUSIC_LIBRARY = {
  lofi: [
    { id: 'lofi1', name: 'Lofi Study Beats', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', mood: 'focus', duration: 180 },
    { id: 'lofi2', name: 'Chill Lofi', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_4a265a1c5c.mp3', mood: 'relax', duration: 156 }
  ],
  
  ambient: [
    { id: 'amb1', name: 'Forest Ambience', url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_310cb0ada7.mp3', mood: 'nature', duration: 240 },
    { id: 'amb2', name: 'Ocean Waves', url: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12345.mp3', mood: 'calm', duration: 300 }
  ],
  
  classical: [
    { id: 'cla1', name: 'Piano Sonata', url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_e9ba58a1c3.mp3', mood: 'elegant', duration: 210 }
  ],
  
  // NEW GENRES
  jazz: [
    { id: 'jazz1', name: 'Smooth Jazz', url: 'https://cdn.pixabay.com/audio/2023/02/28/audio_1234jazz.mp3', mood: 'relaxed', duration: 195 },
    { id: 'jazz2', name: 'Jazz Piano', url: 'https://cdn.pixabay.com/audio/2023/01/15/audio_5678jazz.mp3', mood: 'sophisticated', duration: 220 }
  ],
  
  electronic: [
    { id: 'elec1', name: 'Chillwave', url: 'https://cdn.pixabay.com/audio/2022/11/12/audio_9012elec.mp3', mood: 'focus', duration: 185 },
    { id: 'elec2', name: 'Downtempo', url: 'https://cdn.pixabay.com/audio/2022/09/20/audio_3456elec.mp3', mood: 'calm', duration: 200 }
  ],
  
  nature: [
    { id: 'nat1', name: 'Rainforest', url: 'https://cdn.pixabay.com/audio/2021/11/03/audio_7890nat.mp3', mood: 'nature', duration: 360 },
    { id: 'nat2', name: 'Thunderstorm', url: 'https://cdn.pixabay.com/audio/2022/04/18/audio_2345nat.mp3', mood: 'intense', duration: 420 }
  ]
};

const ALL_TRACKS = Object.values(MUSIC_LIBRARY).flat();

export function MusicLibraryPlusView({ isReading }) {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(ALL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playlist, setPlaylist] = useState(ALL_TRACKS);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [favorites, setFavorites] = useState([]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  useEffect(() => {
    if (isReading && !isPlaying) {
      togglePlay();
    }
  }, [isReading]);
  
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const playNext = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    let nextIndex;
    
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  };
  
  const playPrevious = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(true);
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * currentTrack.duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };
  
  const handleTrackEnd = () => {
    if (isRepeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      playNext();
    }
  };
  
  const filterPlaylist = (genre, mood) => {
    let filtered = ALL_TRACKS;
    
    if (genre !== 'all') {
      filtered = MUSIC_LIBRARY[genre] || [];
    }
    
    if (mood !== 'all') {
      filtered = filtered.filter(track => track.mood === mood);
    }
    
    setPlaylist(filtered);
    if (filtered.length > 0) {
      setCurrentTrack(filtered[0]);
    }
  };
  
  const toggleFavorite = (trackId) => {
    setFavorites(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎵 Music Library</h1>
        <p className="page-subtitle">Enhanced music experience</p>
      </div>
      
      {/* Now Playing */}
      <div className="cozy-card" style={{ padding: 40, marginBottom: 30, background: 'var(--grad-main)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '80px', marginBottom: 16 }}>🎵</div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: 8 }}>
            {currentTrack.name}
          </h2>
          <div style={{ fontSize: '16px', opacity: 0.8, marginBottom: 4 }}>
            {currentTrack.mood}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="range"
            min="0"
            max="100"
            value={(currentTime / currentTrack.duration) * 100}
            onChange={handleSeek}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.6, marginTop: 4 }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <button
            onClick={() => { setIsShuffle(!isShuffle); }}
            className="btn-ghost"
            style={{ opacity: isShuffle ? 1 : 0.5 }}
          >
            <Shuffle size={20} />
          </button>
          
          <button onClick={playPrevious} className="btn-ghost">
            <SkipBack size={24} />
          </button>
          
          <button
            onClick={togglePlay}
            className="btn-main"
            style={{ width: 60, height: 60, borderRadius: '50%', padding: 0 }}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          
          <button onClick={playNext} className="btn-ghost">
            <SkipForward size={24} />
          </button>
          
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className="btn-ghost"
            style={{ opacity: isRepeat ? 1 : 0.5 }}
          >
            <Repeat size={20} />
          </button>
        </div>
        
        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 300, margin: '0 auto' }}>
          <button onClick={() => setIsMuted(!isMuted)} className="btn-ghost">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => { setVolume(e.target.value); setIsMuted(false); }}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', opacity: 0.6, minWidth: 40 }}>{volume}%</span>
        </div>
        
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleTrackEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
      
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select
          value={selectedGenre}
          onChange={(e) => { setSelectedGenre(e.target.value); filterPlaylist(e.target.value, selectedMood); }}
          className="input"
          style={{ maxWidth: 200 }}
        >
          <option value="all">All Genres</option>
          {Object.keys(MUSIC_LIBRARY).map(genre => (
            <option key={genre} value={genre}>{genre.charAt(0).toUpperCase() + genre.slice(1)}</option>
          ))}
        </select>
        
        <select
          value={selectedMood}
          onChange={(e) => { setSelectedMood(e.target.value); filterPlaylist(selectedGenre, e.target.value); }}
          className="input"
          style={{ maxWidth: 200 }}
        >
          <option value="all">All Moods</option>
          <option value="focus">Focus</option>
          <option value="relax">Relax</option>
          <option value="calm">Calm</option>
          <option value="nature">Nature</option>
        </select>
      </div>
      
      {/* Playlist */}
      <div className="cozy-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <List size={20} /> Playlist ({playlist.length} tracks)
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {playlist.map(track => (
            <div
              key={track.id}
              onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
              style={{
                padding: 16,
                background: currentTrack.id === track.id ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.3s'
              }}
            >
              <div style={{ fontSize: '24px' }}>
                {currentTrack.id === track.id && isPlaying ? '🔊' : '🎵'}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: 4 }}>{track.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>
                  {track.mood} • {formatTime(track.duration)}
                </div>
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
                className="btn-ghost"
                style={{ padding: 8 }}
              >
                <Heart size={18} fill={favorites.includes(track.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MusicLibraryPlusView;
