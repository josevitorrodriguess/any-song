package redis

import (
	"context"
	"log"
	"os"

	"github.com/go-redis/redis/v8"
)

func ConnectRedis() *redis.Client {
	redisAddr := os.Getenv("REDIS_ADDR")
	redisPassword := os.Getenv("REDIS_PASSWORD")

	rdb := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: redisPassword,
		DB:       0,
	})

	// Testa a conexão
	if _, err := rdb.Ping(context.Background()).Result(); err != nil {
		log.Fatalf("Erro ao conectar com Redis: %v", err)
	}

	log.Println("Cliente Redis conectado com sucesso!")
	return rdb
}
