package api

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func (api *API) SetupRoutes() {
	// CORS middleware
	api.Router.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true,
	}))

	// Auth routes
	authGroup := api.Router.Group("/auth")
	authGroup.Post("/signin", api.SignInHandler)
	authGroup.Post("/logout", api.AuthMiddleware(), api.LogoutHandler)

	// Protected routes
	protectedGroup := api.Router.Group("/api", api.AuthMiddleware())
	protectedGroup.Get("/protected", api.ProtectedHandler)
	
	// Health check
	api.Router.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})
}

func (api *API) ProtectedHandler(c *fiber.Ctx) error {
	user, exists := GetUserFromContext(c)
	if !exists {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Usuário não encontrado",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Rota protegida acessada com sucesso!",
		"user":    user,
	})
}
