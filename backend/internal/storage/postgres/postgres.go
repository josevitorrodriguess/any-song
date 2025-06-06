package postgres

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/josevitorrodriguess/any-song/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

func loadDBConfig() *DatabaseConfig {
	port, _ := strconv.Atoi(os.Getenv("DB_PORT"))

	return &DatabaseConfig{
		Host:     os.Getenv("DB_HOST"),
		Port:     port,
		User:     os.Getenv("DB_USER"),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   os.Getenv("DB_NAME"),
		SSLMode:  os.Getenv("DB_SSL_MODE"),
	}
}

func ConnectDatabase() *gorm.DB {
	config := loadDBConfig()

	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DBName, config.SSLMode,
	)

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		log.Fatalf("Erro ao conectar com PostgreSQL: %v", err)
	}

	if err = runMigrations(db); err != nil {
		log.Fatalf("Erro ao executar migrações: %v", err)
	}

	seedGenres(db)

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Erro ao obter database instance: %v", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	log.Println("Conectado ao PostgreSQL com sucesso!")
	return db
}

func TestConnection(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}

	return sqlDB.Ping()
}

func runMigrations(db *gorm.DB) error {
	log.Println("Executando migrações...")

	// Drop existing tables in reverse order to avoid foreign key constraints
	if err := db.Migrator().DropTable(&models.Song{}, &models.Artist{}, &models.Genre{}, &models.User{}); err != nil {
		return fmt.Errorf("erro ao dropar tabelas: %v", err)
	}

	// Recreate tables with new schema
	if err := db.AutoMigrate(
		&models.User{},
		&models.Genre{},
		&models.Artist{},
		&models.Song{},
	); err != nil {
		return fmt.Errorf("erro ao executar migrações: %v", err)
	}
	return nil
}

func seedGenres(db *gorm.DB) {
	genres := []string{
		"Pop", "Rock", "Hip Hop", "Rap", "Sertanejo", "Funk", "MPB", "Eletrônica", "Clássica", "Reggae",
		"Samba", "Pagode", "Forró", "Axé", "Blues", "Country", "Gospel", "Indie", "K-Pop", "Trap",
		"R&B", "Soul", "Disco", "Punk", "Metal", "Hardcore", "Folk", "Bossa Nova", "Lo-fi", "House",
		"Techno", "Trance", "Drum and Bass", "Dubstep", "Chillout", "Ambient", "Instrumental", "Opera", "World",
		"Latin", "Reggaeton", "Cumbia", "Ska", "Grunge", "Emo", "New Wave", "Synthpop", "Experimental",
	}
	for _, name := range genres {
		db.FirstOrCreate(&models.Genre{}, models.Genre{Name: name})
	}
}
