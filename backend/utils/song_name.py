import asyncio
from shazamio import Shazam


async def get_song_name(path_original_song: str):
    shazam = Shazam()
    out = await shazam.recognize(path_original_song)  
    print(out)
    if out['matches'] != []:
        return out['track']['title'], out['track']['subtitle']
    else:
        return None, None


if __name__ == "__main__":
    print(asyncio.run(get_song_name("/root/any-song/backend/utils/audios/songs/ROSÉ & Bruno Mars - APT. (Official Music Video).mp3")))