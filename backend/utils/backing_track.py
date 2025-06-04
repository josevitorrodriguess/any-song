from musicai_sdk import MusicAiClient
import dotenv
import os
import requests
dotenv.load_dotenv()

client = MusicAiClient(api_key=os.getenv("MUSICAI_API_KEY"))

def gen_backing_track(song_path):
    song_url = client.upload_file(song_path)

    job_id = client.add_job("Backing Track", workflows='create-instrumental-backing-track', inputUrl=song_url)["id"]

    job = client.wait_for_job(job_id)
    if job["status"] == "SUCCEEDED":
        files = client.download_job_results(job, "./chords")
        print("Result:", files)
        music_url = requests.get(files['new_track']).url
        song_name = song_path.split("/")[-1].split(".")[0]
        os.makedirs("./backing_tracks", exist_ok=True)
        if os.path.exists(f"./backing_tracks/{song_name}.mp3"):
            os.remove(f"./backing_tracks/{song_name}.mp3")
        with open(f"./backing_tracks/{song_name}.mp3", "wb") as f:
            f.write(requests.get(music_url).content)
        return f"./backing_tracks/{song_name}.mp3"
    else:
        print("Job failed!")

    

    client.delete_job(job_id)

    return files