import { useState } from 'react';
import Image from 'next/image';
import styles from './Search.module.css';

export default function Search({ onSongSelect }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    
    // Simulação de busca - aqui você conectará com o backend
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          title: query,
          artist: 'Artist Name',
          duration: '3:45',
          thumbnail: '🎵'
        },
        {
          id: 2,
          title: `${query} (Acoustic Version)`,
          artist: 'Another Artist',
          duration: '4:12',
          thumbnail: '🎵'
        },
        {
          id: 3,
          title: `${query} - Live`,
          artist: 'Live Artist',
          duration: '3:28',
          thumbnail: '🎵'
        }
      ];
      setResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    if (onSongSelect) {
      onSongSelect(song);
    }
  };

  const handleDownload = () => {
    if (selectedSong) {
      // Aqui você enviará a requisição para o backend baixar a música
      console.log('Downloading:', selectedSong);
      alert(`Starting download: ${selectedSong.title} by ${selectedSong.artist}`);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <h3 className={styles.title}>Search for a Song</h3>
      
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.searchInputGroup}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter song name or artist..."
            className={styles.searchInput}
          />
          <button
            type="submit"
            className={styles.searchButton}
            disabled={isSearching || !query.trim()}
          >
            <Image
              src="/search_icon.png"
              alt="Search"
              width={20}
              height={20}
              className={styles.searchIcon}
            />
          </button>
        </div>
      </form>

      {isSearching && (
        <div className={styles.searchingState}>
          <div className={styles.spinner}></div>
          <p>Searching for songs...</p>
        </div>
      )}

      {results.length > 0 && !isSearching && (
        <div className={styles.resultsContainer}>
          <h4 className={styles.resultsTitle}>Search Results</h4>
          <div className={styles.resultsList}>
            {results.map((song) => (
              <div
                key={song.id}
                className={`${styles.songItem} ${
                  selectedSong?.id === song.id ? styles.selected : ''
                }`}
                onClick={() => handleSongSelect(song)}
              >
                <div className={styles.songThumbnail}>
                  {song.thumbnail}
                </div>
                <div className={styles.songInfo}>
                  <p className={styles.songTitle}>{song.title}</p>
                  <p className={styles.songArtist}>{song.artist}</p>
                </div>
                <div className={styles.songDuration}>
                  {song.duration}
                </div>
                <div className={styles.selectIcon}>
                  {selectedSong?.id === song.id ? '✓' : '⊕'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSong && (
        <div className={styles.selectedSong}>
          <div className={styles.selectedInfo}>
            <div className={styles.selectedThumbnail}>
              {selectedSong.thumbnail}
            </div>
            <div className={styles.selectedDetails}>
              <p className={styles.selectedTitle}>{selectedSong.title}</p>
              <p className={styles.selectedArtist}>{selectedSong.artist}</p>
            </div>
          </div>
          <button 
            onClick={handleDownload}
            className={styles.downloadButton}
          >
            Download & Convert
          </button>
        </div>
      )}
    </div>
  );
} 