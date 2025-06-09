import sys
import os
import asyncio

# Adiciona o diretório 'backend' ao sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from catch_lyrics import lyrics
from cochichando import transcribe_full_audio
from song_name import get_song_name
from lsync import LyricsSync
from backing_track import gen_backing_track

async def input_song(audio_path: str):
    song_name, artist_name = await get_song_name(audio_path)
    print(song_name, artist_name)
    if song_name:
        results = lyrics(song_name, artist_name)
        lyrics_text = results['lyrics']
        with open("lyrics.txt", "w", encoding="utf-8") as f:
            f.write(lyrics_text)
        lsync = LyricsSync()
        words, lrc = lsync.sync(audio_path, 'lyrics.txt')
        os.remove('lyrics.txt')
        result = {
            "words": words,
            "lrc": lrc,
            "song_name": song_name,
            "artist_name": artist_name
        }
        return result
    else:
        result = transcribe_full_audio(audio_path, model_size="turbo")
        return result
    
def backing_track(audio_path: str):
    result = gen_backing_track(audio_path)
    return result


if __name__ == "__main__":
    async def main():
        audio_path = "/root/any-song/backend/utils/audios/songs/Seu Pereira e Coletivo 401 - Até Ontem.mp3"

        # Agendamos a tarefa assíncrona
        input_song_task = input_song(audio_path)
        
        # Rodamos a função síncrona `backing_track` em uma thread separada para não bloquear o event loop
        backing_track_task = asyncio.to_thread(backing_track, audio_path)

        # Executamos as duas tarefas em paralelo e esperamos pelos resultados
        input_song_result, backing_track_result = await asyncio.gather(
            input_song_task,
            backing_track_task
        )

        print("--- Resultado do input_song ---")
        print(input_song_result)
        print("\n--- Resultado do backing_track ---")
        print(backing_track_result)

    asyncio.run(main())