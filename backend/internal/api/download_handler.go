package api

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
)

// DownloadRequest represents the download request structure
type DownloadRequest struct {
	Query string `json:"query" binding:"required"`
}

// SearchRequest represents the search request structure
type SearchRequest struct {
	Query      string `json:"query" binding:"required"`
	MaxResults int    `json:"max_results,omitempty"`
}

// SearchResult represents a single search result
type SearchResult struct {
	Title     string `json:"title"`
	Artist    string `json:"artist"`
	Uploader  string `json:"uploader"`
	Duration  int    `json:"duration"`
	URL       string `json:"url"`
	Thumbnail string `json:"thumbnail"`
	ViewCount int64  `json:"view_count"`
}

// DownloadSongHandler handles song download requests from YouTube
func (api *API) DownloadSongHandler(c *fiber.Ctx) error {
	// Check authentication
	_, exists := GetUserFromContext(c)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Usuário não encontrado",
		})
	}

	var req DownloadRequest
	
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Query é obrigatória",
		})
	}

	if req.Query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Query não pode estar vazia",
		})
	}

	// Create temp directory for downloads
	tempDir := fmt.Sprintf("/tmp/anysong-downloads/%d", time.Now().Unix())
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao criar diretório temporário",
		})
	}

	log.Printf("Downloading song with query: %s to %s", req.Query, tempDir)

	// Call the Python script
	cmd := exec.Command("python3", "./utils/yt_downloader.py")
	
	// Set environment variables for the script
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("SONG_QUERY=%s", req.Query),
		fmt.Sprintf("OUTPUT_DIR=%s", tempDir),
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Download script failed: %v", err)
		log.Printf("Script output: %s", string(output))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao baixar música",
			"detail": string(output),
		})
	}

	log.Printf("Download script output: %s", string(output))

	// Find the downloaded file
	files, err := filepath.Glob(filepath.Join(tempDir, "*.mp3"))
	if err != nil || len(files) == 0 {
		log.Printf("No MP3 files found in directory: %s", tempDir)
		// List all files in directory for debugging
		dirFiles, _ := os.ReadDir(tempDir)
		log.Printf("Files in directory:")
		for _, file := range dirFiles {
			log.Printf("  - %s", file.Name())
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Nenhum arquivo foi baixado",
		})
	}

	filePath := files[0]
	
	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Arquivo não foi criado",
		})
	}

	// Get file info
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao ler arquivo",
		})
	}

	// Set headers for download
	fileName := filepath.Base(filePath)
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fileName))
	c.Set("Content-Type", "audio/mpeg")
	c.Set("Content-Length", fmt.Sprintf("%d", fileInfo.Size()))

	// Send file and clean up after
	defer func() {
		go func() {
			time.Sleep(5 * time.Second) // Wait a bit before cleanup
			os.RemoveAll(tempDir)
			log.Printf("Cleaned up temp directory: %s", tempDir)
		}()
	}()

	return c.SendFile(filePath)
}

// SearchSongHandler handles song search requests from YouTube
func (api *API) SearchSongHandler(c *fiber.Ctx) error {
	// Check authentication
	_, exists := GetUserFromContext(c)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Usuário não encontrado",
		})
	}

	var req SearchRequest
	
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Query é obrigatória",
		})
	}

	if req.Query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Query não pode estar vazia",
		})
	}

	// Set default max results if not provided
	if req.MaxResults == 0 {
		req.MaxResults = 3
	}

	log.Printf("Searching songs with query: %s", req.Query)

	// Call the Python script for search only
	cmd := exec.Command("python3", "./utils/yt_downloader.py", "--search-only")
	
	// Set environment variables for the script
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("SONG_QUERY=%s", req.Query),
		fmt.Sprintf("MAX_RESULTS=%d", req.MaxResults),
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Search script failed: %v", err)
		log.Printf("Script output: %s", string(output))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao buscar música",
			"detail": string(output),
		})
	}

	log.Printf("Search script output: %s", string(output))

	// Parse the JSON output from the Python script
	var results []SearchResult
	if err := json.Unmarshal(output, &results); err != nil {
		log.Printf("Error parsing search results: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao processar resultados da busca",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"results": results,
	})
} 