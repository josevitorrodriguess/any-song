package api

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/josevitorrodriguess/any-song/backend/internal/models"
)

func (api *API) CreateArtistHandler(c *fiber.Ctx) error {
	var artist models.Artist
	if err := c.BodyParser(&artist); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Dados inválidos",
		})
	}
	if err := api.ArtistService.CreateArtist(&artist); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao criar artista",
		})
	}
	return c.Status(fiber.StatusCreated).JSON(artist)
}

func (api *API) SearchArtistsHandler(c *fiber.Ctx) error {
	searchTerm := c.Query("name")

	artists, err := api.ArtistService.SearchArtists(searchTerm, 10)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao buscar artistas",
		})
	}

	return c.JSON(artists)
}

func (api *API) GetArtistByIDHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID é obrigatório",
		})
	}
	artist, err := api.ArtistService.GetArtistByID(id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao buscar artista",
		})
	}
	if artist == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Artista não encontrado",
		})
	}
	return c.JSON(artist)
}

func (api *API) GetAllArtistsHandler(c *fiber.Ctx) error {
	artists, err := api.ArtistService.GetAllArtists()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao buscar artistas",
		})
	}
	return c.JSON(artists)
}

func (api *API) UpdateArtistHandler(c *fiber.Ctx) error {
	var artist models.Artist
	if err := c.BodyParser(&artist); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Dados inválidos",
		})
	}
	if artist.ID == uuid.Nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID é obrigatório",
		})
	}
	if err := api.ArtistService.UpdateArtist(&artist); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao atualizar artista",
		})
	}
	return c.JSON(artist)
}

func (api *API) DeleteArtistHandler(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID é obrigatório",
		})
	}
	if err := api.ArtistService.DeleteArtist(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao deletar artista",
		})
	}
	return c.JSON(fiber.Map{
		"message": "Artista deletado com sucesso",
	})
}
