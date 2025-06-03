package main

import (
	"github.com/joho/godotenv"
	"github.com/josevitorrodriguess/any-song/backend/internal/config"
)

func main() {
	godotenv.Load(".env.local")

	app, err := config.GetFireBaseApp()
	if err != nil {
		panic(err)
	}
	_ = app
}
