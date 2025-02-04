'use client';

import { create } from 'zustand';

interface Track {
  id: string;
  name: string;
  artist?: string;
  duration: number;
  url: string;
}

interface AudioStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  tracks: Track[];
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setQueue: (queue: Track[]) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  nextTrack: () => void; // ✅ Added
  prevTrack: () => void; // ✅ Added
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 1,
  queue: [],
  tracks: [],
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
  setQueue: (queue) => set({ queue }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  removeFromQueue: (trackId) =>
    set((state) => ({
      queue: state.queue.filter((track) => track.id !== trackId),
    })),
  addTrack: (track) => set((state) => ({ tracks: [...state.tracks, track] })),
  removeTrack: (trackId) =>
    set((state) => ({
      tracks: state.tracks.filter((track) => track.id !== trackId),
    })),

  nextTrack: () => {
    const { queue, currentTrack, setCurrentTrack } = get();
    if (!queue.length) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0; // Loop back
    setCurrentTrack(queue[nextIndex]);
  },

  prevTrack: () => {
    const { queue, currentTrack, setCurrentTrack } = get();
    if (!queue.length) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1; // Loop back
    setCurrentTrack(queue[prevIndex]);
  },
}));
