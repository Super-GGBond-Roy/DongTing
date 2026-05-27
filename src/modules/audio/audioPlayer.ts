let currentAudio: HTMLAudioElement | null = null;
let currentStopFn: (() => void) | null = null;

export function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
      if (currentStopFn) {
        currentStopFn();
        currentStopFn = null;
      }
    }

    const audio = new Audio(url);
    currentAudio = audio;

    audio.onended = () => {
      currentAudio = null;
      if (currentStopFn) {
        currentStopFn();
        currentStopFn = null;
      }
      resolve();
    };

    audio.onerror = (_e) => {
      currentAudio = null;
      if (currentStopFn) {
        currentStopFn();
        currentStopFn = null;
      }
      reject(new Error('Audio playback failed'));
    };

    audio.play().catch(reject);
  });
}

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (currentStopFn) {
    currentStopFn();
    currentStopFn = null;
  }
}

export function onPlaybackStop(fn: () => void) {
  currentStopFn = fn;
}
