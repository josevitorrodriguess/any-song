package gcs

import (
	"context"
	"fmt"
	"os"

	"cloud.google.com/go/storage"
)

func ConnectGoogleCloudStorage() (*storage.Client, error) {
	if os.Getenv("GOOGLE_APPLICATION_CREDENTIALS") == "" {
		return nil, fmt.Errorf("GOOGLE_APPLICATION_CREDENTIALS environment variable is not set")
	}

	client, err := storage.NewClient(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to create Google Cloud Storage client: %w", err)
	}

	return client, nil
}
