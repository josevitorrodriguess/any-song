import yt_dlp
import os
import sys
import json
import re

def extract_artist_from_title(title, uploader):
    """
    Extrai o artista do título do vídeo
    """
    # Padrões comuns: "Artista - Música", "Música - Artista", "Artista: Música"
    patterns = [
        r'^([^-]+)\s*-\s*(.+)$',  # Artista - Música
        r'^(.+)\s*-\s*([^-]+)$',  # Música - Artista  
        r'^([^:]+)\s*:\s*(.+)$',  # Artista: Música
        r'^(.+)\s*by\s+([^(]+)',  # Música by Artista
        r'^([^(]*?)\s*\(',        # Artista (qualquer coisa)
    ]
    
    for pattern in patterns:
        match = re.search(pattern, title, re.IGNORECASE)
        if match:
            part1, part2 = match.groups()[0].strip(), match.groups()[1].strip() if len(match.groups()) > 1 else ""
            
            # Se o uploader está no título, provavelmente é o artista
            if uploader.lower() in part1.lower():
                return part1
            elif part2 and uploader.lower() in part2.lower():
                return part2
            else:
                return part1
    
    # Se não encontrou padrão, usa o uploader como fallback
    return uploader

def download_song(song_query: str, output_dir: str = "./audios/songs"):
    """
    Downloads a song from YouTube using yt-dlp
    
    Args:
        song_query (str): Search query for the song
        output_dir (str): Directory to save the downloaded file
    
    Returns:
        dict: Information about the downloaded file or error
    """
    # Verifica se a pasta existe, se não, cria
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    try:
        # Configurações do yt-dlp com hook de progresso
        def progress_hook(d):
            if d['status'] == 'downloading':
                percent = d.get('_percent_str', 'N/A')
                speed = d.get('_speed_str', 'N/A')
                print(f"📥 Progresso: {percent} - Velocidade: {speed}")
            elif d['status'] == 'finished':
                print(f"✅ Download finalizado: {d['filename']}")
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
            'default_search': 'ytsearch1',  # Apenas o primeiro resultado
            'noplaylist': True,
            'quiet': False,  # Permitir output para progresso
            'no_warnings': True,
            'progress_hooks': [progress_hook],
        }
        
        print(f"🔍 Buscando: {song_query}")
        
        # Baixa o áudio
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Primeiro extrai informações sem baixar
            info = ydl.extract_info(f"ytsearch1:{song_query}", download=False)
            
            if 'entries' in info and len(info['entries']) > 0:
                video_info = info['entries'][0]
                
                # Extrair artista de forma mais inteligente
                title = video_info.get('title', 'Título desconhecido')
                uploader = video_info.get('uploader', 'Canal desconhecido')
                
                # Tentar extrair artista do título
                artist = extract_artist_from_title(title, uploader)
                
                print(f"✅ Encontrado: {title}")
                print(f"🎤 Artista: {artist}")
                print(f"📺 Canal: {uploader}")
                print(f"⏱️ Duração: {video_info.get('duration', 0)} segundos")
                print(f"👁️ Visualizações: {video_info.get('view_count', 0):,}")
                
                # Agora baixa o arquivo
                print("🚀 Iniciando download...")
                ydl.download([video_info['webpage_url']])
                
                # Encontra o arquivo baixado
                expected_filename = ydl.prepare_filename(video_info).replace('.webm', '.mp3').replace('.m4a', '.mp3')
                if not os.path.exists(expected_filename):
                    # Tenta encontrar qualquer arquivo MP3 na pasta
                    mp3_files = [f for f in os.listdir(output_dir) if f.endswith('.mp3')]
                    if mp3_files:
                        expected_filename = os.path.join(output_dir, mp3_files[-1])  # Pega o mais recente
                
                return {
                    'success': True,
                    'title': title,
                    'artist': artist,
                    'uploader': uploader,
                    'duration': video_info.get('duration', 0),
                    'view_count': video_info.get('view_count', 0),
                    'file_path': expected_filename,
                    'url': video_info.get('webpage_url', ''),
                    'thumbnail': video_info.get('thumbnail', '')
                }
            else:
                return {
                    'success': False,
                    'error': 'Nenhum resultado encontrado para a busca'
                }
                
    except Exception as e:
        error_msg = f"Erro ao baixar música: {str(e)}"
        print(f"❌ {error_msg}")
        return {
            'success': False,
            'error': error_msg
        }

def search_only(song_query: str, max_results: int = 3):
    """
    Apenas busca músicas sem baixar - VERSÃO OTIMIZADA
    
    Args:
        song_query (str): Search query for the song
        max_results (int): Maximum number of results to return
    
    Returns:
        list: List of search results
    """
    try:
        # Configurações super otimizadas para velocidade
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'skip_download': True,
            'socket_timeout': 10,  # Timeout mais baixo
            'retries': 1,  # Menos tentativas
            'fragment_retries': 1,
            'ignoreerrors': True,  # Ignora erros para continuar
            'no_color': True,
            'writesubtitles': False,
            'writeautomaticsub': False,
            'writethumbnail': False,
            'writeinfojson': False,
            'writedescription': False,
            'writeAnnotations': False,
            'dump_single_json': False,
            'extract_format': False,
            'geturl': False,
            'gettitle': False,
            'getid': False,
            'getduration': False,
            'getfilename': False,
            'getformat': False,
            'simulate': False,
        }
        
        print(f"🔍 Busca rápida: {song_query}")
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Busca mais específica para ser mais rápida
            search_query = f"ytsearch{max_results}:{song_query}"
            info = ydl.extract_info(search_query, download=False)
            
            results = []
            if 'entries' in info:
                for i, entry in enumerate(info['entries'][:max_results]):  # Garantir limite
                    if entry is None:
                        continue
                        
                    title = entry.get('title', 'Título desconhecido')
                    uploader = entry.get('uploader', entry.get('channel', 'Canal desconhecido'))
                    
                    # Extração de artista mais rápida
                    artist = extract_artist_from_title(title, uploader)
                    
                    # Só pega informações essenciais
                    result = {
                        'title': title,
                        'artist': artist,
                        'uploader': uploader,
                        'duration': entry.get('duration', 0) or 0,
                        'url': entry.get('webpage_url', ''),
                        'thumbnail': entry.get('thumbnail', ''),
                        'view_count': entry.get('view_count', 0) or 0,
                    }
                    
                    results.append(result)
            
            print(f"✅ Encontrado {len(results)} resultados")
            return results
            
    except Exception as e:
        print(f"❌ Erro na busca: {str(e)}")
        return []

# Uso do programa via linha de comando ou variáveis de ambiente
if __name__ == "__main__":
    # Verifica se foi solicitado apenas busca
    is_search_only = '--search-only' in sys.argv
    
    # Verifica se foi chamado com variáveis de ambiente (pelo backend Go)
    song_query = os.environ.get('SONG_QUERY')
    output_dir = os.environ.get('OUTPUT_DIR', './audios/songs')
    max_results = int(os.environ.get('MAX_RESULTS', 3))
    
    if song_query:
        if is_search_only:
            # Apenas busca, retorna JSON
            results = search_only(song_query, max_results)
            print(json.dumps(results, ensure_ascii=False))
        else:
            # Download tradicional
            print(f"🎵 Executando download via variável de ambiente...")
            result = download_song(song_query, output_dir)
            
            if result['success']:
                print(f"✅ Download concluído: {result['file_path']}")
            else:
                print(f"❌ Falha no download: {result['error']}")
                sys.exit(1)
                
    elif len(sys.argv) > 1 and not is_search_only:
        # Modo linha de comando tradicional
        song_query = sys.argv[1]
        output_dir = sys.argv[2] if len(sys.argv) > 2 else './audios/songs'
        
        print(f"🎵 Executando download via linha de comando...")
        result = download_song(song_query, output_dir)
        
        if result['success']:
            print(f"✅ Download concluído: {result['file_path']}")
        else:
            print(f"❌ Falha no download: {result['error']}")
            sys.exit(1)
            
    else:
        # Modo interativo
        song_query = input("🎵 Digite o nome da música: ")
        result = download_song(song_query)
        
        if result['success']:
            print(f"✅ Download concluído!")
            print(f"📁 Arquivo: {result['file_path']}")
            print(f"🎵 Título: {result['title']}")
            print(f"🎤 Artista: {result['artist']}")
        else:
            print(f"❌ Falha no download: {result['error']}")