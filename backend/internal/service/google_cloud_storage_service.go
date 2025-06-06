package service

import (
	"context"
	"fmt"

	"cloud.google.com/go/storage"
)

type GoogleCloudStorageService struct {
	GoogleCloudStorageClient *storage.Client
}

func NewGoogleCloudStorageService(client *storage.Client) *GoogleCloudStorageService {
	return &GoogleCloudStorageService{
		GoogleCloudStorageClient: client,
	}
}

func (s *GoogleCloudStorageService) UploadFile(bucketName, objectName string, fileData []byte) (string, error) {
	ctx := context.Background()
	bucket := s.GoogleCloudStorageClient.Bucket(bucketName)
	obj := bucket.Object(objectName)
	w := obj.NewWriter(ctx)

	if _, err := w.Write(fileData); err != nil {
		return "", fmt.Errorf("erro ao escrever no bucket: %w", err)
	}

	if err := w.Close(); err != nil {
		return "", fmt.Errorf("erro ao fechar o writer: %w", err)
	}

	url := fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectName)
	return url, nil
}
