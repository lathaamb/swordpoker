import { create } from "zustand";
import { Howl } from "howler";

interface AudioState {
  backgroundMusic: Howl | null;
  hitSound: Howl | null;
  successSound: Howl | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: Howl) => void;
  setHitSound: (sound: Howl) => void;
  setSuccessSound: (sound: Howl) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: false, // Start with sound enabled by default
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    // Update all sounds
    if (backgroundMusic) {
      backgroundMusic.mute(newMutedState);
    }
    
    // Update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Howler handles sound instances automatically
      hitSound.volume(0.3);
      hitSound.play();
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.play();
    }
  }
}));
