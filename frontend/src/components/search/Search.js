import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Search.module.css';

export default function Search({ onSongSelect }) {
  const { authenticatedFetch } = useAuth();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [searchCache, setSearchCache] = useState({}); // Cache para buscas

  // Função para simular progresso do download
  const simulateProgress = () => {
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95; // Para em 95% até o download real terminar
        }
        // Progresso mais rápido no início, mais lento no final
        const increment = prev < 50 ? 8 : prev < 80 ? 4 : 2;
        return Math.min(prev + increment, 95);
      });
    }, 800);
    return interval;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const searchKey = query.trim().toLowerCase();
    
    // Verifica se já temos essa busca no cache
    if (searchCache[searchKey]) {
      console.log('🚀 Usando cache para:', searchKey);
      setResults(searchCache[searchKey]);
      setSelectedSong(null);
      return;
    }

    setIsSearching(true);
    setResults([]);
    setSelectedSong(null);
    
    try {
      console.log('🔍 Buscando no YouTube:', query.trim());
      
      const response = await authenticatedFetch('/search-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          max_results: 3
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na busca: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.results) {
        // Converter os dados da API para o formato esperado pelo frontend
        const formattedResults = data.results.map((result, index) => ({
          id: index + 1,
          title: result.title,
          artist: result.artist,
          duration: formatDuration(result.duration),
          thumbnail: '🎵',
          query: query.trim(),
          views: formatViews(result.view_count),
          url: result.url
        }));
        
        // Salva no cache
        setSearchCache(prev => ({
          ...prev,
          [searchKey]: formattedResults
        }));
        
        setResults(formattedResults);
        console.log('✅ Busca concluída:', formattedResults.length, 'resultados');
      } else {
        throw new Error('Nenhum resultado encontrado');
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
      // Fallback para dados simulados em caso de erro (só 2 resultados)
      setTimeout(() => {
        const mockResults = [
          {
            id: 1,
            title: query.includes('justin bieber') ? 'Baby' : query,
            artist: query.includes('justin bieber') ? 'Justin Bieber' : 'Artista Principal',
            duration: '3:45',
            thumbnail: '🎵',
            query: query,
            views: '2.8B'
          },
          {
            id: 2,
            title: `${query} (Versão Acústica)`,
            artist: query.includes('justin bieber') ? 'Justin Bieber' : 'Artista Acústico',
            duration: '4:12',
            thumbnail: '🎵',
            query: `${query} acoustic`,
            views: '15M'
          },
          {
            id: 3,
            title: `${query} - Ao Vivo`,
            artist: query.includes('justin bieber') ? 'Justin Bieber' : 'Artista Ao Vivo',
            duration: '3:28',
            thumbnail: '🎵',
            query: `${query} live`,
            views: '5.2M'
          }
        ];
        setResults(mockResults);
      }, 300);
    } finally {
      setIsSearching(false);
    }
  };

  // Função auxiliar para formatar duração
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Função auxiliar para formatar visualizações
  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000000) {
      return `${(views / 1000000000).toFixed(1)}B`;
    } else if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    setDownloadStatus('');
    setDownloadProgress(0);
    if (onSongSelect) {
      onSongSelect(song);
    }
  };

  const handleDownload = async () => {
    if (!selectedSong) return;
    
    setIsDownloading(true);
    setDownloadStatus('Conectando ao YouTube...');
    
    // Iniciar simulação de progresso
    const progressInterval = simulateProgress();

    try {
      // Fazer requisição para o backend
      const response = await authenticatedFetch('/download-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: selectedSong.query || selectedSong.title
        })
      });

      if (!response.ok) {
        // Para erros, a resposta pode ser JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro no download');
        } else {
          throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Completar progresso
      clearInterval(progressInterval);
      setDownloadProgress(100);
      setDownloadStatus('Download concluído! Salvando arquivo...');

      // Para sucesso, a resposta é um arquivo (blob)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Extrair nome do arquivo do header Content-Disposition ou usar nome padrão
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${selectedSong.title} - ${selectedSong.artist}.mp3`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadStatus('✅ Arquivo salvo! Agora você pode fazer upload dele na aba "Upload File".');
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Erro no download:', error);
      setDownloadStatus(`❌ Erro: ${error.message}`);
      setDownloadProgress(0);
    } finally {
      setIsDownloading(false);
      // Reset progress after a delay
      setTimeout(() => setDownloadProgress(0), 3000);
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
            placeholder="Digite nome da música ou artista..."
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
          <p>Buscando músicas...</p>
        </div>
      )}

      {results.length > 0 && !isSearching && (
        <div className={styles.resultsContainer}>
          <h4 className={styles.resultsTitle}>Resultados da Busca</h4>
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
                  <p className={styles.songViews}>{song.views} visualizações</p>
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

          {isDownloading && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <p className={styles.progressText}>{downloadProgress}%</p>
            </div>
          )}

          <button 
            onClick={handleDownload}
            className={styles.downloadButton}
            disabled={isDownloading}
          >
            {isDownloading ? 'Baixando...' : 'Baixar para PC'}
          </button>
        </div>
      )}

      {downloadStatus && (
        <div className={styles.downloadStatus}>
          <p>{downloadStatus}</p>
        </div>
      )}
    </div>
  );
} 