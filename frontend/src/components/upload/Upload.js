import { useState, useCallback } from 'react';
import styles from './Upload.module.css';

export default function Upload({ onFileUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    // Verificar se é um arquivo de áudio válido
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    const validExtensions = ['.mp3', '.wav'];
    
    const isValidType = validTypes.includes(file.type) || 
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      alert('Please upload only .mp3 or .wav files');
      return;
    }

    setUploadedFile(file);
    if (onFileUpload) {
      onFileUpload(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (onFileUpload) {
      onFileUpload(null);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <h3 className={styles.title}>Upload Your Audio File</h3>
      
      {!uploadedFile ? (
        <div
          className={`${styles.dropZone} ${dragActive ? styles.active : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className={styles.dropContent}>
            <div className={styles.icon}>🎵</div>
            <p className={styles.dropText}>
              Drag & drop your audio file here
            </p>
            <p className={styles.supportedFormats}>
              Supported formats: MP3, WAV
            </p>
            <div className={styles.orDivider}>
              <span>or</span>
            </div>
            <label htmlFor="file-input" className={styles.browseButton}>
              Browse Files
            </label>
            <input
              id="file-input"
              type="file"
              accept=".mp3,.wav,audio/*"
              onChange={handleFileInput}
              className={styles.fileInput}
            />
          </div>
        </div>
      ) : (
        <div className={styles.filePreview}>
          <div className={styles.fileInfo}>
            <div className={styles.fileIcon}>🎵</div>
            <div className={styles.fileDetails}>
              <p className={styles.fileName}>{uploadedFile.name}</p>
              <p className={styles.fileSize}>
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button 
              onClick={removeFile}
              className={styles.removeButton}
              title="Remove file"
            >
              ✕
            </button>
          </div>
          <div className={styles.processButton}>
            <button className={styles.convertButton}>
              Convert to Karaoke
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 