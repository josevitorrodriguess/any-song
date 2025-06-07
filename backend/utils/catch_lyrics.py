# If you need to make a high volume of requests, consider using proxies
import json
from musicxmatch_api import MusixMatchAPI
import os
import sys

api = MusixMatchAPI()

def lyrics(music_name: str, output_dir: str = None): 
    if output_dir is None:
        # Usar caminho relativo ao diretório atual
        output_dir = os.path.join(os.path.dirname(__file__), "lyrics")
    
    search = api.search_tracks(music_name)
    
    if not search['message']['body']['track_list']:
        raise Exception(f"No tracks found for: {music_name}")
    
    track_id = search['message']['body']['track_list'][0]['track']['track_id']
    lyrics_response = api.get_track_lyrics(track_id)
    
    # Criar diretório se não existir
    os.makedirs(output_dir, exist_ok=True)
    
    lyrics_json = {
        "lyrics": lyrics_response['message']['body']['lyrics']['lyrics_body'],
        "track_id": track_id,
        "music_name": music_name
    }
    
    # Limpar nome do arquivo
    safe_filename = "".join(c for c in music_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
    file_path = os.path.join(output_dir, f"{safe_filename}.json")
    
    with open(file_path, "w", encoding='utf-8') as f:
        json.dump(lyrics_json, f, indent=3, ensure_ascii=False)
    
    return file_path, lyrics_json

if __name__ == "__main__":
    if len(sys.argv) > 1:
        music_name = sys.argv[1]
    else:
        music_name = "Até Ontem Seu Pereira e Coletivo 401"
    
    try:
        file_path, data = lyrics(music_name)
        result = {
            "success": True,
            "file_path": file_path,
            "lyrics": data["lyrics"],
            "track_id": str(data["track_id"]),
            "music_name": data["music_name"]
        }
        print(json.dumps(result))
    except Exception as e:
        result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(result))
        sys.exit(1)