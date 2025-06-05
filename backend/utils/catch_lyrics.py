# If you need to make a high volume of requests, consider using proxies
import json
from musicxmatch_api import MusixMatchAPI
import os
api = MusixMatchAPI()

def lyrics(music_name: str): 
    search = api.search_tracks(music_name)
    track_id = search['message']['body']['track_list'][0]['track']['track_id']
    lyrics = api.get_track_lyrics(track_id)
    os.makedirs("/root/any-song/backend/utils/lyrics", exist_ok=True)
    lyrics_json = {
        "lyrics": lyrics['message']['body']['lyrics']['lyrics_body'],
        "track_id": track_id,
        "music_name": music_name
    }
    with open(f"/root/any-song/backend/utils/lyrics/{music_name}.json", "w", encoding='utf-8') as f:
        json.dump(lyrics_json, f, indent=3, ensure_ascii=False)

if __name__ == "__main__":
    music_name = "Até Ontem Seu Pereira e Coletivo 401"
    lyrics(music_name)