package api

import "github.com/gofiber/fiber/v2"

func (api *API) SetupRoutes() {

	userGroup := api.Router.Group("/user")

	userGroup.Post("/signin", api.SignInHandler)
	userGroup.Post("/logout", api.LogoutHandler)

	api.Router.Get("/protected", api.ProtectedHandler)
}

func (api *API) ProtectedHandler(c *fiber.Ctx) error {
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Rota protegida acessada com sucesso!",
	})
}
