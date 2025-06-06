package config

import (
	"context"
	"fmt"
	"os"

	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
)

func GetFireBaseApp() (*firebase.App, error) {
	path := os.Getenv("FIREBASE_CREDENTIALS_PATH")
	if path == "" {
		return nil, fmt.Errorf("FIREBASE_CREDENTIALS_PATH environment variable is not set")
	}

	opt := option.WithCredentialsFile(path)

	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing app: %v", err)
	}
	return app, nil
}
