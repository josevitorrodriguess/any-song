# If you need to make a high volume of requests, consider using proxies
import json
from musicxmatch_api import MusixMatchAPI
import os
import sys

api = MusixMatchAPI()

def lyrics(music_name: str, artist_name: str = None): 
    
    if artist_name:
        music_name = f"{music_name} {artist_name}"
        search = api.search_tracks(music_name)
    else:
        search = api.search_tracks(music_name)
    
    if not search['message']['body']['track_list']:
        raise Exception(f"No tracks found for: {music_name}")
    
    track_id = search['message']['body']['track_list'][0]['track']['track_id']
    lyrics_response = api.get_track_lyrics(track_id)
    
    lyrics_json = {
        "lyrics": lyrics_response['message']['body']['lyrics']['lyrics_body'],
        "music_name": music_name
    }
    
    return lyrics_json

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