from lsync import LyricsSync
from utils.catch_lyrics import lyrics


lyrics_path = "/mnt/c/Users/biabc/Desktop/any-song/backend/utils/lyrics/seu_pereira_e_coletivo_401.txt"
audio_path = "/mnt/c/Users/biabc/Desktop/any-song/backend/utils/audios/songs/seu_pereira_e_coletivo_401.mp3"
lsync = LyricsSync()
words, lrc = lsync.sync(audio_path, lyrics_path)
