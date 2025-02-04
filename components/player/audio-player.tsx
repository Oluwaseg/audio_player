'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudioStore } from '@/lib/hooks/use-audio-store';
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const isSeekingRef = useRef(false); // Prevents auto-update when user is dragging

  const {
    currentTrack,
    isPlaying,
    volume,
    setIsPlaying,
    setVolume,
    nextTrack,
    prevTrack,
  } = useAudioStore();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack?.url || '';
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (!isSeekingRef.current) {
        setProgress((audio.currentTime / (audio.duration || 1)) * 100);
      }
    };

    const setInitialProgress = () => {
      setProgress(0); // Reset progress when track changes
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('durationchange', setInitialProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('durationchange', setInitialProgress);
    };
  }, [currentTrack]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setVolume(volume === 0 ? 1 : 0);
  };

  // Seek track position when user adjusts the slider
  const handleSeek = (value: number[]) => {
    isSeekingRef.current = true;
    const newTime = (audioRef.current!.duration * value[0]) / 100;
    setProgress(value[0]);
    audioRef.current!.currentTime = newTime;
  };

  // Release slider -> finalize seeking
  const handleSeekEnd = () => {
    isSeekingRef.current = false;
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <div className='fixed bottom-0 left-0 right-0 bg-background border-t'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            {/* Enable Previous Track Button */}
            <Button
              variant='ghost'
              size='icon'
              onClick={prevTrack}
              disabled={!prevTrack}
            >
              <SkipBack className='h-6 w-6' />
            </Button>

            {/* Play / Pause Button */}
            <Button variant='ghost' size='icon' onClick={togglePlay}>
              {isPlaying ? (
                <Pause className='h-6 w-6' />
              ) : (
                <Play className='h-6 w-6' />
              )}
            </Button>

            {/* Enable Next Track Button */}
            <Button
              variant='ghost'
              size='icon'
              onClick={nextTrack}
              disabled={!nextTrack}
            >
              <SkipForward className='h-6 w-6' />
            </Button>
          </div>

          {/* Song Name & Progress */}
          <div className='flex-1 mx-4'>
            <div className='text-sm font-medium mb-2'>
              {currentTrack.name}
              {currentTrack.artist && (
                <span className='text-muted-foreground'>
                  {' '}
                  - {currentTrack.artist}
                </span>
              )}
            </div>
            <Slider
              value={[progress]}
              max={100}
              step={1}
              className='w-full'
              onValueChange={handleSeek}
              onValueCommit={handleSeekEnd}
            />
          </div>

          {/* Volume Controls */}
          <div className='flex items-center space-x-2'>
            <Button variant='ghost' size='icon' onClick={toggleMute}>
              {volume === 0 ? (
                <VolumeX className='h-5 w-5' />
              ) : (
                <Volume2 className='h-5 w-5' />
              )}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className='w-24'
              onValueChange={(value) => setVolume(value[0] / 100)}
            />
          </div>
        </div>
      </div>
      <audio ref={audioRef} src={currentTrack.url} onEnded={nextTrack} />
    </div>
  );
}
