from utils.cochichando import transcribe_and_save
audio_path = "backend/utils/audios/songs/seu_pereira_e_coletivo_401.mp3"
def karaokefy(audio_path: str):
    result = transcribe_and_save(audio_path)

    print(result)
    
karaokefy(audio_path)