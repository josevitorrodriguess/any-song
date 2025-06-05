import yt_dlp
import os

def search(nome_musica, pasta_saida="./audios/songs"):
    # Verifica se a pasta existe, se não, cria
    if not os.path.exists(pasta_saida):
        os.makedirs(pasta_saida)
    
    try:
        # Configurações do yt-dlp
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(pasta_saida, '%(title)s.%(ext)s'),
            'default_search': 'ytsearch',  # Usa a busca do YouTube
            'noplaylist': True,  # Apenas o primeiro resultado
        }
        
        # Baixa o áudio
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"ytsearch:{nome_musica}", download=True)
            
            if 'entries' in info:
                # ytsearch retorna uma lista de vídeos
                info = info['entries'][0]
                
        
        return True
    except Exception as e:
        return False

# Uso do programa
if __name__ == "__main__":
    nome_musica = input("Digite o nome da música: ")
    search(nome_musica)