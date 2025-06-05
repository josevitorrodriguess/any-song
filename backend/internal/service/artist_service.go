package service

import (
	"unicode"

	"github.com/google/uuid"
	"github.com/josevitorrodriguess/any-song/backend/internal/models"
	"golang.org/x/text/unicode/norm"
	"gorm.io/gorm"
)

type ArtistService struct {
	DB *gorm.DB
}

func NewArtistService(db *gorm.DB) *ArtistService {
	return &ArtistService{
		DB: db,
	}
}

func (s *ArtistService) CreateArtist(artist *models.Artist) error {
	artist.NormalizedName = removeAccentsAndSpaces(artist.Name)
	return s.DB.Create(artist).Error
}

func (s *ArtistService) SearchArtists(rawSearchTerm string, limit int) ([]models.Artist, error) {
	normalizedSearchTerm := removeAccentsAndSpaces(rawSearchTerm)
	searchPattern := "%" + normalizedSearchTerm + "%"

	var artists []models.Artist

	err := s.DB.Model(&models.Artist{}).
		Where("normalized_name LIKE ?", searchPattern).
		Order("name asc").
		Limit(limit).
		Find(&artists).Error

	if err != nil {
		return nil, err
	}

	return artists, nil
}

func (s *ArtistService) GetArtistByID(id string) (*models.Artist, error) {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	var artist models.Artist
	if err := s.DB.Where("id = ?", uuid).First(&artist).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &artist, nil
}

func (s *ArtistService) GetAllArtists() ([]models.Artist, error) {
	var artists []models.Artist
	if err := s.DB.Order("name ASC").Find(&artists).Error; err != nil {
		return nil, err
	}
	return artists, nil
}

func (s *ArtistService) UpdateArtist(artist *models.Artist) error {
	artist.NormalizedName = removeAccentsAndSpaces(artist.Name)
	return s.DB.Model(&models.Artist{}).Where("id = ?", artist.ID).Updates(artist).Error
}

func (s *ArtistService) DeleteArtist(id string) error {
	var artist models.Artist
	if err := s.DB.Where("id = ?", id).First(&artist).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil
		}
		return err
	}
	return s.DB.Delete(&artist).Error
}
func removeAccentsAndSpaces(s string) string {
	t := norm.NFD.String(s)
	result := make([]rune, 0, len(t))
	for _, r := range t {
		if unicode.Is(unicode.Mn, r) {
			continue
		}
		if r != ' ' {
			result = append(result, unicode.ToLower(r))
		}
	}
	return string(result)
}
