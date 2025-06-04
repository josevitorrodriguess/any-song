package api

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type UserInfo struct {
	UID   string `json:"uid"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

func (api *API) AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Extrair token do header Authorization
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token de autorização necessário",
			})
		}

		// Remover "Bearer " do início do token
		token := strings.Replace(authHeader, "Bearer ", "", 1)
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token inválido",
			})
		}

		// Verificar token com Firebase
		decodedToken, err := api.Auth.VerifyIDToken(context.Background(), token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token inválido ou expirado",
			})
		}

		userInfo := UserInfo{
			UID: decodedToken.UID,
		}
		if email, ok := decodedToken.Claims["email"].(string); ok {
			userInfo.Email = email
		}
		if name, ok := decodedToken.Claims["name"].(string); ok {
			userInfo.Name = name
		}

		c.Locals("user", userInfo)

		return c.Next()
	}
}

func GetUserFromContext(c *fiber.Ctx) (UserInfo, bool) {
	user := c.Locals("user")
	if user == nil {
		return UserInfo{}, false
	}

	userInfo, ok := user.(UserInfo)
	return userInfo, ok
}
