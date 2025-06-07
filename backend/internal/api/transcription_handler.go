package api

import (
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type TranscriptionRequest struct {
	AudioPath string `json:"audio_path" validate:"required"`
	ModelSize string `json:"model_size,omitempty"` // tiny, base, small, medium, large-v3
	Timeout   int    `json:"timeout,omitempty"`    // em segundos
}

type TranscriptionResponse struct {
	Filename          string                `json:"filename"`
	ProcessingMode    string                `json:"processing_mode"`
	Duration          float64               `json:"duration"`
	DurationMinutes   float64               `json:"duration_minutes"`
	Segments          []TranscriptionSegment `json:"segments"`
	FullText          string                `json:"full_text"`
	WordCount         int                   `json:"word_count"`
	SegmentsCount     int                   `json:"segments_count"`
	Timing            TimingInfo            `json:"timing"`
	SavedPath         string                `json:"saved_path,omitempty"`
	Success           bool                  `json:"success"`
	Error             string                `json:"error,omitempty"`
	ExecutionDuration string                `json:"execution_duration"`
}

type TranscriptionSegment struct {
	ID       int            `json:"id"`
	Start    float64        `json:"start"`
	End      float64        `json:"end"`
	Duration float64        `json:"duration"`
	Text     string         `json:"text"`
	Words    []WordInfo     `json:"words"`
}

type WordInfo struct {
	Start       float64 `json:"start"`
	End         float64 `json:"end"`
	Word        string  `json:"word"`
	Probability float64 `json:"probability"`
}

type TimingInfo struct {
	TotalTime          float64 `json:"total_time"`
	ModelLoadTime      float64 `json:"model_load_time"`
	TranscribeTime     float64 `json:"transcribe_time"`
	SpeedRatio         float64 `json:"speed_ratio"`
	CoveragePercentage float64 `json:"coverage_percentage"`
}

func (api *API) TranscribeAudioHandler(c *fiber.Ctx) error {
	var req TranscriptionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Invalid request body",
			"details": err.Error(),
		})
	}

	// Validar se o caminho do áudio foi fornecido
	if strings.TrimSpace(req.AudioPath) == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "audio_path is required",
		})
	}

	// Definir timeout (padrão: 300 segundos = 5 minutos para transcrição de áudio)
	timeout := 300 * time.Second
	if req.Timeout > 0 {
		timeout = time.Duration(req.Timeout) * time.Second
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	start := time.Now()

	// Executar o script Python
	result, err := api.executeTranscriptionScript(ctx, req.AudioPath, req.ModelSize)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error":             "Failed to execute transcription script",
			"details":           err.Error(),
			"execution_duration": time.Since(start).String(),
		})
	}

	result.ExecutionDuration = time.Since(start).String()

	if !result.Success {
		return c.Status(500).JSON(result)
	}

	return c.JSON(result)
}

func (api *API) executeTranscriptionScript(ctx context.Context, audioPath, modelSize string) (*TranscriptionResponse, error) {
	// Validar se o modelo é válido
	validModels := []string{"tiny", "base", "small", "medium", "large-v3", "turbo"}
	if modelSize == "" {
		modelSize = "base" // padrão
	}
	
	isValidModel := false
	for _, model := range validModels {
		if model == modelSize {
			isValidModel = true
			break
		}
	}
	
	if !isValidModel {
		return &TranscriptionResponse{
			Success: false,
			Error:   fmt.Sprintf("Invalid model size. Valid options: %s", strings.Join(validModels, ", ")),
		}, nil
	}

	// Converter caminho relativo se necessário
	if !filepath.IsAbs(audioPath) {
		audioPath = filepath.Join("backend", "utils", "audios", "songs", audioPath)
	}

	// Criar código Python para executar a transcrição
	pythonCode := fmt.Sprintf(`
import sys
import os
import json
sys.path.append('%s')
from cochichando import transcribe_and_save, transcribe_full_audio, save_transcription

try:
    audio_path = '%s'
    model_size = '%s'
    
    if not os.path.exists(audio_path):
        result = {
            'success': False,
            'error': f'Arquivo não encontrado: {audio_path}'
        }
    else:
        # Executar transcrição
        transcription_result = transcribe_full_audio(audio_path, model_size)
        
        if 'error' in transcription_result:
            result = {
                'success': False,
                'error': transcription_result['error']
            }
        else:
            # Salvar resultado
            saved_path = save_transcription(transcription_result)
            
            result = transcription_result.copy()
            result['success'] = True
            result['saved_path'] = saved_path
    
    print(json.dumps(result, ensure_ascii=False, indent=2))
    
except Exception as e:
    result = {
        'success': False,
        'error': f'Erro na execução: {str(e)}'
    }
    print(json.dumps(result))
    sys.exit(1)
`, filepath.Join("backend", "utils"), audioPath, modelSize)

	// Executar o código Python
	cmd := exec.CommandContext(ctx, "python3", "-c", pythonCode)
	
	output, err := cmd.CombinedOutput()
	
	if err != nil {
		return &TranscriptionResponse{
			Success: false,
			Error:   fmt.Sprintf("Script execution failed: %s. Output: %s", err.Error(), string(output)),
		}, nil
	}

	// Parse do resultado JSON
	var result TranscriptionResponse
	if err := json.Unmarshal(output, &result); err != nil {
		return &TranscriptionResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to parse script output: %s. Raw output: %s", err.Error(), string(output)),
		}, nil
	}

	return &result, nil
}

// Handler para listar arquivos de áudio disponíveis
func (api *API) ListAudioFilesHandler(c *fiber.Ctx) error {
	audioDir := filepath.Join("backend", "utils", "audios", "songs")
	
	files, err := filepath.Glob(filepath.Join(audioDir, "*.mp3"))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to list audio files",
			"details": err.Error(),
		})
	}
	
	// Adicionar outros formatos
	wavFiles, _ := filepath.Glob(filepath.Join(audioDir, "*.wav"))
	m4aFiles, _ := filepath.Glob(filepath.Join(audioDir, "*.m4a"))
	
	files = append(files, wavFiles...)
	files = append(files, m4aFiles...)
	
	// Extrair apenas os nomes dos arquivos
	fileNames := make([]string, len(files))
	for i, file := range files {
		fileNames[i] = filepath.Base(file)
	}
	
	return c.JSON(fiber.Map{
		"audio_files": fileNames,
		"count": len(fileNames),
		"directory": audioDir,
	})
}