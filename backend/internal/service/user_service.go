package service

import (
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
func (s *UserService) UserExists(email string) (bool, error) {
	var count int64
	if err := s.DB.Model(&models.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
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
