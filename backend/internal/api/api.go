package api

import (
	"context"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/gofiber/fiber/v2"
	"github.com/josevitorrodriguess/any-song/backend/internal/config"
	"github.com/josevitorrodriguess/any-song/backend/internal/service"
	"gorm.io/gorm"
)

type API struct {
	Firebase    *firebase.App
	Auth        *auth.Client
	UserService *service.UserService
	Router      *fiber.App
}

func InitApi(db *gorm.DB, router *fiber.App) *API {
	app, err := config.GetFireBaseApp()
	if err != nil {
		panic("Failed to initialize Firebase app: " + err.Error())
	}

	authClient, err := app.Auth(context.Background())
	if err != nil {
		panic("Failed to initialize Firebase Auth client: " + err.Error())
	}

	userService := service.NewUserService(db)

	return &API{
		Firebase:    app,
		Auth:        authClient,
		UserService: userService,
		Router:      router,
	}
}
