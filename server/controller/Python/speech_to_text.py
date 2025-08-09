import os
import torch
import torchaudio
from datetime import datetime
from transformers import AutoModel

def speech_to_text(audio_file_path, language_code):
    """Convert speech from audio file to text using ai4bharat/indic-conformer-600m-multilingual"""
    try:
        # Map language codes for ASR
        asr_lang_map = {
            'hi': 'hi', 'en': 'en', 'mr': 'mr', 'ta': 'ta', 'te': 'te',
            'gu': 'gu', 'kn': 'kn', 'ml': 'ml', 'bn': 'bn'
        }
        asr_lang = asr_lang_map.get(language_code, 'en')

        # Load model
        model = AutoModel.from_pretrained(
            "ai4bharat/indic-conformer-600m-multilingual",
            trust_remote_code=True
        )

        # Load audio
        wav, sr = torchaudio.load(audio_file_path)
        wav = torch.mean(wav, dim=0, keepdim=True)  # Convert to mono

        # Resample if needed
        target_sample_rate = 16000
        if sr != target_sample_rate:
            resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=target_sample_rate)
            wav = resampler(wav)

        # Perform ASR (you can switch between "ctc" or "rnnt")
        transcription_ctc = model(wav, asr_lang, "ctc")

        # Return both types of transcription
        return {
            "ctc": transcription_ctc
        }

    except Exception as e:
        print(f"Error: {e}")
        return None