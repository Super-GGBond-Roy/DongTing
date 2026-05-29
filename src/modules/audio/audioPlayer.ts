let currentAudio: HTMLAudioElement | null = null;
let currentStopFn: (() => void) | null = null;
let currentObjectUrl: string | null = null;

function cleanupObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function resetCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  cleanupObjectUrl();
  if (currentStopFn) {
    currentStopFn();
    currentStopFn = null;
  }
}

async function createPlayableUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Audio resource request failed: ${response.status}`);
  }

  const blob = await response.blob();
  currentObjectUrl = URL.createObjectURL(blob);
  return currentObjectUrl;
}

export async function playAudio(url: string, onStop?: () => void): Promise<void> {
  resetCurrentAudio();
  currentStopFn = onStop || null;

  try {
    const playableUrl = await createPlayableUrl(url);

    return await new Promise((resolve, reject) => {
      const audio = new Audio(playableUrl);
      currentAudio = audio;

      audio.onended = () => {
        resetCurrentAudio();
        resolve();
      };

      audio.onerror = () => {
        const error = audio.error
          ? new Error(`Audio playback failed: ${audio.error.code}`)
          : new Error('Audio playback failed');
        resetCurrentAudio();
        reject(error);
      };

      audio.play().catch((err) => {
        resetCurrentAudio();
        reject(err);
      });
    });
  } catch (err) {
    resetCurrentAudio();
    throw err;
  }
}

export function stopAudio() {
  resetCurrentAudio();
}

export function onPlaybackStop(fn: () => void) {
  currentStopFn = fn;
}
