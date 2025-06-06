package api

import (
	"context"
	"fmt"

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

	// Primeiro, tenta buscar pelo Firebase UID
	user, err := api.UserService.GetUserByFirebaseUID(decodedToken.UID)
	if err != nil && err.Error() != fmt.Sprintf("usuário com Firebase UID '%s' não encontrado", decodedToken.UID) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao verificar usuário por Firebase UID",
		})
	}

	// Se não encontrou pelo Firebase UID, tenta buscar pelo email
	if user == nil {
		user, err = api.UserService.GetUserByEmail(userEmail)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Erro ao verificar usuário por email",
			})
		}

		// Se encontrou pelo email mas não tem Firebase UID, atualiza
		if user != nil && user.FirebaseUID == "" {
			user.FirebaseUID = decodedToken.UID
			if err := api.UserService.UpdateUser(user); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Erro ao atualizar Firebase UID do usuário",
				})
			}
		}
	}

	// Se ainda não existe, cria um novo usuário
	if user == nil {
		newUser := &models.User{
			FirebaseUID:    decodedToken.UID,
			Email:          userEmail,
			Name:           decodedToken.Claims["name"].(string),
			ProfilePicture: decodedToken.Claims["picture"].(string),
			IsActive:       true,
		}

		if err := api.UserService.CreateUser(newUser); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Erro ao criar usuário",
			})
		}
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

func (api *API) FindUserByNameHandler(c *fiber.Ctx) error {
	email := c.Params("username")
	if email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Nome é obrigatório",
		})
	}

	user, err := api.UserService.GetUserByEmail(email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao buscar usuário",
		})
	}

	if user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Usuário não encontrado",
		})
	}

	return c.JSON(user)
}

func (api *API) UpdateUserHandler(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Dados inválidos",
		})
	}

	if user.FirebaseUID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Firebase UID é obrigatório",
		})
	}

	existingUser, err := api.UserService.GetUserByFirebaseUID(user.FirebaseUID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Erro ao buscar usuário",
		})
	}

	if existingUser == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Usuário não encontrado",
		})
	}

	if err := api.UserService.UpdateUser(&user); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err,
		})
	}

	return c.JSON(user)
}

func (api *API) DeleteUserHandler(c *fiber.Ctx) error {
	firebaseUID := c.Params("firebaseUID")
	if firebaseUID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Firebase UID é obrigatório",
		})
	}

	err := api.UserService.DeleteUser(firebaseUID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err,
		})
	}

	return c.JSON(fiber.Map{
		"message": "Usuário deletado com sucesso",
	})
}