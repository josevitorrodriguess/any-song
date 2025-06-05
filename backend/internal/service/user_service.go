package service

import (
	"fmt"

	"github.com/josevitorrodriguess/any-song/backend/internal/models"
	"gorm.io/gorm"
)

type UserService struct {
	DB *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{
		DB: db,
	}
}

func (s *UserService) CreateUser(user *models.User) error {
	return s.DB.Create(user).Error
}

func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := s.DB.Where("email = ?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Usuário não encontrado - retorna nil sem erro
			return nil, nil
		}
		// Outros erros são retornados
		return nil, err
	}
	return &user, nil
}

func (s *UserService) GetUserByName(name string) (*models.User, error) {
	var user models.User
	if err := s.DB.Where("name = ?", name).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("usuário com nome '%s' não encontrado", name)
		}
		return nil, err
	}
	return &user, nil
}
