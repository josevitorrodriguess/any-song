from musicai_sdk import MusicAiClient
import dotenv
import os
import requests
dotenv.load_dotenv()

client = MusicAiClient(api_key=os.getenv("MUSICAI_API_KEY"))

def gen_backing_track(song_path: str):
    try:
        print(f"Iniciando processamento de: {song_path}")
        
        # Fazer upload do arquivo de música
        print("Fazendo upload do arquivo...")
        song_url = client.upload_file(song_path)
        print(f"Upload concluído. URL: {song_url}")

        # Definir parâmetros do workflow para criar backing track instrumental
        workflow_params = {'inputUrl': song_url}

        # Criar o job usando o slug correto do workflow
        print("Criando job...")
        job_response = client.add_job(
            job_name="Backing Track",
            workflow_slug='create-instrumental-backing-track',
            params=workflow_params
        )
        job_id = job_response["id"]
        print(f"Job criado com ID: {job_id}")

        # Aguardar a conclusão do job
        print("Aguardando conclusão do job...")
        job = client.wait_for_job_completion(job_id)
        print(f"Job finalizado com status: {job['status']}")

        if job["status"] == "SUCCEEDED":
            print("Job bem-sucedido! Processando resultados...")
            
            # Processar os resultados diretamente das URLs
            if "result" in job and job["result"]:
                print("Resultados encontrados no job:", job["result"])
                
                # Procurar pela backing track (pode ter nomes diferentes)
                backing_track_url = None
                
                if 'backing_track' in job["result"]:
                    backing_track_url = job["result"]['backing_track']
                
                # Se não encontrou com as chaves conhecidas, pegar o primeiro resultado
                if not backing_track_url:
                    result_keys = list(job["result"].keys())
                    if result_keys:
                        backing_track_url = job["result"][result_keys[0]]
                        print(f"Usando primeiro resultado disponível '{result_keys[0]}': {backing_track_url}")
                
                if backing_track_url:
                    song_name = song_path.split("/")[-1].split(".")[0]
                    os.makedirs("./backend/utils/audios/backing_tracks", exist_ok=True)
                    
                    output_path = f"./backend/utils/audios/backing_tracks/{song_name}.mp3"
                    if os.path.exists(output_path):
                        os.remove(output_path)
                        
                    # Baixar apenas o arquivo de backing track
                    print("Baixando apenas a backing track...")
                    response = requests.get(backing_track_url)
                    with open(output_path, "wb") as f:
                        f.write(response.content)
                    
                    # Deletar o job após o processamento
                    client.delete_job(job_id)
                    print(f"Backing track salva em: {output_path}")
                    
                    return output_path
                else:
                    print("Não foi possível encontrar a URL da backing track nos resultados!")
                    client.delete_job(job_id)
                    return None
            else:
                print("Nenhum resultado encontrado no job!")
                print("Dados do job:", job)
                client.delete_job(job_id)
                return None
        else:
            print(f"Job falhou com status: {job['status']}")
            if 'error' in job:
                print(f"Erro: {job['error']}")
            client.delete_job(job_id)
            return None
            
    except Exception as e:
        print(f"Erro durante o processamento: {str(e)}")
        return None

if __name__ == "__main__":
    result = gen_backing_track("/root/any-song/backend/utils/audios/Seu Pereira e Coletivo 401 - Até Ontem.mp3")
    if result:
        print(f"Backing track criado com sucesso: {result}")
    else:
        print("Falha ao criar backing track")