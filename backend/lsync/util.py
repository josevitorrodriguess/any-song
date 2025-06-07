import librosa
import soundfile as sf
from .config import ORIGINAL_SR, TARGET_SR
from lsync.lrc_formatter import Word
from typing import List
import dataclasses
import pandas as pd
import numpy as np
import os

window_size = int(TARGET_SR * 15)
hop_length = window_size


def get_audio_segments(audio):
    """Split audio to segments"""
    return librosa.util.frame(audio, frame_length=window_size, hop_length=hop_length, axis=0)


def get_audio_segments_by_onsets(audio):
    onset_times = librosa.onset.onset_detect(
        y=audio, sr=TARGET_SR, backtrack=True)
    onset_boundaries = np.concatenate([onset_times, [len(audio)]])
    segments = []
    start_onset = 0
    for onset in onset_boundaries:
        segments.append(audio[start_onset:onset])
    return segments


def read_text(text_path):
    with open(text_path, 'r') as file:
        data = file.read()
        return data


def save_audio(audio, name, sr=ORIGINAL_SR, out_path="output/vocals"):
    """Save audio file, creating directory if it doesn't exist"""
    os.makedirs(out_path, exist_ok=True)
    sf.write(f'{out_path}/{name}.wav', audio, sr)


def save_audio_file(audio, path, sr=ORIGINAL_SR):
    """Save audio file, creating directory if it doesn't exist"""
    directory = os.path.dirname(path)
    if directory:
        os.makedirs(directory, exist_ok=True)
    sf.write(f'{path}.wav', audio, sr)


def save_lrc(lrc: str, name: str):
    """Save LRC file, creating directory if it doesn't exist"""
    output_dir = 'output/lrc'
    os.makedirs(output_dir, exist_ok=True)
    with open(f'{output_dir}/{name}.lrc', 'w+') as fp:
        fp.write(lrc)


def save_words(words: List[Word], name: str):
    """Save words to CSV file, creating directory if it doesn't exist"""
    output_dir = 'output/words'
    os.makedirs(output_dir, exist_ok=True)
    df = pd.DataFrame([dataclasses.asdict(w) for w in words])
    df.to_csv(f"{output_dir}/{name}.csv", index=False)
