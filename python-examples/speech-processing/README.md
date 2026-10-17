# speech-processing — Python examples

One small, commented script per concept. Run any file with `python <file>`.

| Concept | File |
|---|---|
| Sound is a pressure wave | `01-sound-sampling-and-speech-data/01_sig-0.py` |
| Sampling and the Nyquist limit | `01-sound-sampling-and-speech-data/02_sig-1.py` |
| Aliasing: when sampling is too slow | `01-sound-sampling-and-speech-data/03_sig-2.py` |
| Amplitude, decibels and loudness | `01-sound-sampling-and-speech-data/04_sig-3.py` |
| Quantization and bit depth | `01-sound-sampling-and-speech-data/05_sig-4.py` |
| Sources of data: speech corpora and recording | `01-sound-sampling-and-speech-data/06_sig-5.py` |
| The speech chain and its applications | `01-sound-sampling-and-speech-data/07_sig-6.py` |
| The Fourier transform: finding the frequencies | `02-frequency-analysis-and-spectrograms/01_freq-0.py` |
| FFT: why it is fast | `02-frequency-analysis-and-spectrograms/02_freq-1.py` |
| Windowing and spectral leakage | `02-frequency-analysis-and-spectrograms/03_freq-2.py` |
| Frames: short pieces of nearly stationary sound | `02-frequency-analysis-and-spectrograms/04_freq-3.py` |
| The spectrogram | `02-frequency-analysis-and-spectrograms/05_freq-4.py` |
| Time–frequency trade-off | `02-frequency-analysis-and-spectrograms/06_freq-5.py` |
| Pitch from autocorrelation | `02-frequency-analysis-and-spectrograms/07_freq-6.py` |
| How speech is made: the source–filter model | `03-speech-features/01_feat-0.py` |
| Pre-emphasis: boosting the highs | `03-speech-features/02_feat-1.py` |
| The mel scale: how we hear pitch | `03-speech-features/03_feat-2.py` |
| Mel filterbank | `03-speech-features/04_feat-3.py` |
| Log-mel spectrograms | `03-speech-features/05_feat-4.py` |
| MFCCs: cepstral coefficients | `03-speech-features/06_feat-5.py` |
| Deltas, energy and zero-crossings | `03-speech-features/07_feat-6.py` |
| Voice activity detection and normalisation | `03-speech-features/08_feat-7.py` |
| Automatic speech recognition: the problem | `04-speech-recognition/01_asr-0.py` |
| Word error rate | `04-speech-recognition/02_asr-1.py` |
| Classic ASR: HMMs with Gaussian mixtures | `04-speech-recognition/03_asr-2.py` |
| Neural acoustic models | `04-speech-recognition/04_asr-3.py` |
| CTC: learning without alignments | `04-speech-recognition/05_asr-4.py` |
| Attention encoder–decoder and transducers | `04-speech-recognition/06_asr-5.py` |
| Decoding with a language model | `04-speech-recognition/07_asr-6.py` |
| Large multilingual models such as Whisper | `04-speech-recognition/08_asr-7.py` |
| Keyword spotting and wake words | `04-speech-recognition/09_asr-8.py` |
| Text-to-speech: the pipeline | `05-speech-synthesis/01_tts-0.py` |
| Text normalisation and phonemes | `05-speech-synthesis/02_tts-1.py` |
| Acoustic models: Tacotron and FastSpeech | `05-speech-synthesis/03_tts-2.py` |
| Vocoders: from spectrogram to waveform | `05-speech-synthesis/04_tts-3.py` |
| Prosody, expressiveness and voice cloning | `05-speech-synthesis/05_tts-4.py` |
| Evaluating synthetic speech | `05-speech-synthesis/06_tts-5.py` |
| Speaker recognition: identification and verification | `06-speakers-emotion-and-diarization/01_spk-0.py` |
| Speaker embeddings: i-vectors and x-vectors | `06-speakers-emotion-and-diarization/02_spk-1.py` |
| Verification scores, thresholds and EER | `06-speakers-emotion-and-diarization/03_spk-2.py` |
| Diarization: who spoke when | `06-speakers-emotion-and-diarization/04_spk-3.py` |
| Emotion, language and paralinguistics | `06-speakers-emotion-and-diarization/05_spk-4.py` |
| Noise and speech enhancement | `07-enhancement-and-microphone-arrays/01_enh-0.py` |
| Time–frequency masking and neural enhancement | `07-enhancement-and-microphone-arrays/02_enh-1.py` |
| Beamforming with a microphone array | `07-enhancement-and-microphone-arrays/03_enh-2.py` |
| Echo cancellation and reverberation | `07-enhancement-and-microphone-arrays/04_enh-3.py` |
| Audio compression and codecs | `08-codecs-privacy-and-choosing-an-approach/01_app-0.py` |
| Privacy, consent and deepfakes | `08-codecs-privacy-and-choosing-an-approach/02_app-1.py` |
| Choosing an approach for a speech project | `08-codecs-privacy-and-choosing-an-approach/03_app-2.py` |
