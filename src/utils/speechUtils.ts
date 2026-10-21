/**
 * Speech utilities for Speech-to-Text and Text-to-Speech
 */

let cachedVoices: SpeechSynthesisVoice[] = [];

const loadVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export const isSpeechRecognitionSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
};

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export class VoiceDictation {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private isListening = false;

  constructor(
    onResult: (transcript: string) => void,
    onError?: (err: string) => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'ro-RO'; // Default Romanian

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        onResult(transcript);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError?.(event.error || 'Eroare microfon');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd?.();
      };
    }
  }

  public start(lang = 'ro-RO') {
    if (!this.recognition || this.isListening) return;
    try {
      this.recognition.lang = lang;
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      console.warn('Recognition start error:', e);
    }
  }

  public stop() {
    if (!this.recognition || !this.isListening) return;
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (e) {
      console.warn('Recognition stop error:', e);
    }
  }

  public getListeningState() {
    return this.isListening;
  }
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export const speakMessage = (text: string, onEnd?: () => void) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  stopSpeaking();

  // Strip code blocks, markdown links, symbols for clean reading
  const clean = text
    .replace(/```[\s\S]*?```/g, ' [secvență de cod] ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_#`~[\]()>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1500);

  if (!clean) {
    onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(clean);
  activeUtterance = utterance;
  utterance.lang = 'ro-RO';

  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  const roVoice = cachedVoices.find(
    (v) =>
      v.lang.toLowerCase().startsWith('ro') ||
      v.lang.toLowerCase().includes('ro-ro')
  );

  if (roVoice) {
    utterance.voice = roVoice;
  }

  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    activeUtterance = null;
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
};

export const isSpeakingActive = (): boolean => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
};
