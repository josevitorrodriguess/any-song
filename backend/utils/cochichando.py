import os
import json
import time
from faster_whisper import WhisperModel


def transcribe_full_audio(audio_path: str, model_size: str = "base"):
    """
    Transcreve um arquivo de áudio completo (especialmente música) usando faster-whisper
    Otimizado para não perder partes da música por causa de silêncios
    
    Args:
        audio_path (str): Caminho para o arquivo de áudio
        model_size (str): Tamanho do modelo (tiny, base, small, medium, large-v3)
    
    Returns:
        dict: Resultado da transcrição completa com timestamps
    """
    
    if not os.path.exists(audio_path):
        return {"error": f"Arquivo não encontrado: {audio_path}"}
    
    try:
        start_time = time.time()
        print(f"🎵 Carregando modelo Whisper: {model_size}")
        
        # Inicializar o modelo
        model_start = time.time()
        model = WhisperModel(model_size, device="cpu", compute_type="int8")
        model_load_time = time.time() - model_start
        print(f"⏱️  Modelo carregado em: {model_load_time:.2f}s")
        
        print(f"🎤 Transcrevendo música completa: {os.path.basename(audio_path)}")
        
        # Configurações otimizadas para música completa - modo multilíngue
        transcribe_params = {
            #"beam_size": 5,
            "word_timestamps": True,
            #"vad_filter": False,  # Desabilitar VAD para música
            #"no_speech_threshold": 0.1,  # Mais permissivo para música
            #"logprob_threshold": -1.0,   # Mais permissivo
            #"compression_ratio_threshold": 2.4,  # Mais permissivo
            #"condition_on_previous_text": False,  # Não manter contexto linguístico
            #"patience": 2,  # Mais paciência para decodificação
            #"length_penalty": 1.0,
            #"repetition_penalty": 1.01,
            #"temperature": [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],  # Múltiplas tentativas
            #"without_timestamps": False,  # Manter timestamps
            "task": "transcribe",  # Só transcrever, não traduzir
        }
            
        print("🔄 Processando (pode demorar para músicas longas)...")
        
        # Transcrever
        transcribe_start = time.time()
        segments, info = model.transcribe(audio_path, **transcribe_params)
        transcribe_time = time.time() - transcribe_start
        print(f"⏱️  Transcrição concluída em: {transcribe_time:.2f}s")
        
        print(f"🔤 Processamento multilíngue ativo")
        print(f"⏱️  Duração total: {info.duration:.2f}s ({info.duration/60:.1f} min)")
        
        # Processar resultados
        result = {
            "filename": os.path.basename(audio_path),
            "processing_mode": "multilingual",
            "duration": info.duration,
            "duration_minutes": info.duration / 60,
            "segments": [],
            "full_text": "",
            "word_count": 0,
            "segments_count": 0
        }
        
        all_text = []
        word_count = 0
        last_end_time = 0
        
        print("\n📝 Segmentos encontrados:")
        print("-" * 60)
        
        for i, segment in enumerate(segments):
            segment_data = {
                "id": i + 1,
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "duration": round(segment.end - segment.start, 2),
                "text": segment.text.strip(),
                "words": []
            }
            
            # Verificar se há gaps grandes (possível problema de detecção)
            if i > 0 and (segment.start - last_end_time) > 30:
                print(f"⚠️  Gap detectado: {last_end_time:.1f}s -> {segment.start:.1f}s ({segment.start - last_end_time:.1f}s)")
            
            last_end_time = segment.end
            
            # Adicionar timestamps de palavras
            if hasattr(segment, 'words') and segment.words:
                for word in segment.words:
                    word_data = {
                        "start": round(word.start, 2),
                        "end": round(word.end, 2),
                        "word": word.word.strip(),
                        "probability": round(word.probability, 3)
                    }
                    segment_data["words"].append(word_data)
                    word_count += 1
            
            result["segments"].append(segment_data)
            all_text.append(segment.text.strip())
            
            # Mostrar progresso detalhado
            print(f"[{segment.start:6.1f}s -> {segment.end:6.1f}s] {segment.text.strip()}")
        
        result["full_text"] = " ".join(all_text)
        result["word_count"] = word_count
        result["segments_count"] = len(result["segments"])
        
        print("-" * 60)
        print(f"✅ Transcrição concluída!")
        print(f"📊 Estatísticas:")
        print(f"   • {result['segments_count']} segmentos")
        print(f"   • {result['word_count']} palavras")
        print(f"   • {result['duration_minutes']:.1f} minutos processados")
        
        # Verificar se a música foi processada até o final
        coverage_percentage = (last_end_time / info.duration) * 100
        print(f"   • {coverage_percentage:.1f}% da música transcrita")
        
        # Calcular tempo total e velocidade
        total_time = time.time() - start_time
        speed_ratio = info.duration / total_time
        print(f"   • Tempo total: {total_time:.2f}s")
        print(f"   • Velocidade: {speed_ratio:.1f}x tempo real")
        print(f"   • Carregamento modelo: {model_load_time:.2f}s")
        print(f"   • Processamento: {transcribe_time:.2f}s")
        
        if coverage_percentage < 90:
            print("⚠️  ATENÇÃO: Menos de 90% da música foi transcrita!")
            print("💡 Isso pode indicar muito silêncio no final ou problema no arquivo")
        
        # Adicionar métricas de tempo ao resultado
        result["timing"] = {
            "total_time": round(total_time, 2),
            "model_load_time": round(model_load_time, 2),
            "transcribe_time": round(transcribe_time, 2),
            "speed_ratio": round(speed_ratio, 1),
            "coverage_percentage": round(coverage_percentage, 1)
        }
        return result['segments']
        
    except Exception as e:
        return {"error": f"Erro na transcrição: {str(e)}"}


def save_transcription(result: dict, output_path: str = None):
    """
    Salva a transcrição em arquivo JSON
    """
    if output_path is None:
        # Criar nome do arquivo baseado no áudio original
        audio_name = result.get('filename', 'audio').replace('.mp3', '').replace('.wav', '')
        output_path = f"backend/utils/lyrics/{audio_name}.json"
    
    # Criar diretório se não existir
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"💾 Transcrição salva em: {output_path}")
        return output_path
    except Exception as e:
        print(f"❌ Erro ao salvar: {e}")
        return None


def print_full_transcript(result: dict):
    """
    Imprime a transcrição completa de forma organizada
    """
    print("\n" + "="*80)
    print(f"TRANSCRIÇÃO COMPLETA: {result.get('filename', 'Audio')}")
    print("="*80)
    print(f"Duração: {result.get('duration_minutes', 0):.1f} minutos")
    print(f"Modo: {result.get('processing_mode', 'N/A')}")
    print(f"Segmentos: {result.get('segments_count', 0)}")
    print(f"Palavras: {result.get('word_count', 0)}")
    print("-"*80)
    print(result.get('full_text', ''))
    print("="*80)


def transcribe_and_save(audio_file: str):
    # Teste com arquivo de áudio
    if os.path.exists(audio_file):
        print("🎵 Iniciando transcrição completa da música...")
        # Transcrever com configurações otimizadas
        try:
            result = transcribe_full_audio(audio_file, model_size="turbo")
            save_transcription(result)
            return result
        except Exception as e:
            if "error" not in result:
                # Mostrar transcrição completa
                print_full_transcript(result)
                
                # Salvar resultado
                saved_path = save_transcription(result)
                if saved_path:
                    print(f"📁 Arquivo salvo: {saved_path}")
            else:
                print(f"❌ {result['error']}")


        # else:
        #     print(f"❌ Arquivo não encontrado: {audio_file}")
            
        #     # Listar arquivos disponíveis
        #     songs_dir = "/root/any-song/backend/utils/audios/songs/"
        #     if os.path.exists(songs_dir):
        #         files = [f for f in os.listdir(songs_dir) if f.endswith(('.mp3', '.wav', '.m4a'))]
        #         if files:
        #             print(f"\n💡 Arquivos disponíveis em {songs_dir}:")
        #             for f in files:
        #                 print(f"   • {f}")
        #         else:
        #             print(f"📁 Pasta {songs_dir} está vazia")
        #     else:
        #         print(f"📁 Pasta {songs_dir} não existe") 