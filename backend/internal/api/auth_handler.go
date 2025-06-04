package api

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/josevitorrodriguess/any-song/backend/internal/models"
)

type SignInRequest struct {
	IdToken string `json:"idToken"`
}

func (api *API) SignInHandler(c *fiber.Ctx) error {
	var req SignInRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Dados inválidos",
		})
	}

	if req.IdToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Token de autenticação é obrigatório",
		})
	}

	decodedToken, err := api.Auth.VerifyIDToken(context.Background(), req.IdToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Token inválido",
		})
	}
	userEmail := decodedToken.Claims["email"].(string)

	user, err := api.UserService.GetUserByEmail(userEmail)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao verificar usuário",
		})
	}
	if user == nil {
		api.UserService.CreateUser(&models.User{
			Email:          userEmail,
			Name:           decodedToken.Claims["name"].(string),
			ProfilePicture: decodedToken.Claims["picture"].(string),
			IsActive:       true,
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"valid": true,
		"user": fiber.Map{
			"uid":     decodedToken.UID,
			"email":   userEmail,
			"name":    decodedToken.Claims["name"],
			"picture": decodedToken.Claims["picture"],
		},
	})
}

func (api *API) LogoutHandler(c *fiber.Ctx) error {
	user, exists := GetUserFromContext(c)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Usuário não encontrado",
		})
	}

	err := api.Auth.RevokeRefreshTokens(context.Background(), user.UID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao fazer logout",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Logout realizado com sucesso",
	})
}
