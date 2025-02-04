'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllPlaylists, getAllTracks, getDB } from '@/lib/db';
import { useAudioStore } from '@/lib/hooks/use-audio-store';
import { cn } from '@/lib/utils';
import { ListMusic, Music2, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [selectedTab, setSelectedTab] = useState<'tracks' | 'playlists'>(
    'tracks'
  );
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [tracks, setTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const { addTrack, setCurrentTrack } = useAudioStore();

  useEffect(() => {
    loadContent();
  }, [selectedTab]);

  const loadContent = async () => {
    if (selectedTab === 'tracks') {
      const allTracks = await getAllTracks();
      setTracks(allTracks);
    } else {
      const allPlaylists = await getAllPlaylists();
      setPlaylists(allPlaylists);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const db = await getDB();

    for (const file of files) {
      try {
        const url = URL.createObjectURL(file);
        const track = {
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          duration: 0,
          url,
          createdAt: Date.now(),
        };

        await db.add('tracks', track);
        addTrack(track);

        toast.success(`${track.name} has been added to your library`);

        await loadContent();
      } catch (error) {
        toast.error('Failed to add track');
      }
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    try {
      const db = await getDB();
      const playlist = {
        id: crypto.randomUUID(),
        name: newPlaylistName,
        tracks: [],
        createdAt: Date.now(),
      };

      await db.add('playlists', playlist);
      setNewPlaylistName('');

      toast.success(`${playlist.name} has been created`);

      await loadContent();
    } catch (error) {
      toast.error('Failed to create playlist');
    }
  };

  const handleDeleteTrack = async (id: string) => {
    try {
      const db = await getDB();
      await db.delete('tracks', id);
      await loadContent();

      toast.success('Track has been removed');
    } catch (error) {
      toast.error('Failed to delete track');
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    try {
      const db = await getDB();
      await db.delete('playlists', id);
      await loadContent();

      toast.success('Playlist has been removed');
    } catch (error) {
      toast.error('Failed to delete playlist');
    }
  };

  return (
    <div className={cn('pb-12 w-64', className)}>
      <div className='space-y-4 py-4'>
        <div className='px-3 py-2'>
          <h2 className='mb-2 px-4 text-lg font-semibold'>Library</h2>
          <div className='space-y-1'>
            <Button
              variant={selectedTab === 'tracks' ? 'secondary' : 'ghost'}
              className='w-full justify-start'
              onClick={() => setSelectedTab('tracks')}
            >
              <Music2 className='mr-2 h-4 w-4' />
              Tracks
            </Button>
            <Button
              variant={selectedTab === 'playlists' ? 'secondary' : 'ghost'}
              className='w-full justify-start'
              onClick={() => setSelectedTab('playlists')}
            >
              <ListMusic className='mr-2 h-4 w-4' />
              Playlists
            </Button>
          </div>
        </div>
        <div className='px-3 py-2'>
          <div className='flex items-center justify-between px-4'>
            <h2 className='text-lg font-semibold'>
              {selectedTab === 'tracks' ? 'Tracks' : 'Playlists'}
            </h2>
            {selectedTab === 'tracks' ? (
              <div>
                <Input
                  type='file'
                  id='audio-upload'
                  className='hidden'
                  accept='audio/*'
                  multiple
                  onChange={handleFileUpload}
                />
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() =>
                    document.getElementById('audio-upload')?.click()
                  }
                >
                  <Upload className='h-4 w-4' />
                </Button>
              </div>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Playlist</DialogTitle>
                  </DialogHeader>
                  <div className='grid gap-4 py-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='playlist-name'>Playlist Name</Label>
                      <Input
                        id='playlist-name'
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder='Enter playlist name'
                      />
                    </div>
                    <Button onClick={handleCreatePlaylist}>
                      Create Playlist
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <ScrollArea className='h-[300px] px-1'>
            <div className='space-y-1 p-2'>
              {selectedTab === 'tracks' ? (
                tracks.length > 0 ? (
                  tracks.map((track) => (
                    <div
                      key={track.id}
                      className='flex items-center justify-between p-2 hover:bg-accent rounded-md group'
                    >
                      <Button
                        variant='ghost'
                        className='h-auto p-0 flex-1 justify-start font-normal'
                        onClick={() => setCurrentTrack(track)}
                      >
                        {track.name}
                      </Button>
                      <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => handleDeleteTrack(track.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='text-sm text-muted-foreground px-2'>
                    No tracks yet
                  </p>
                )
              ) : playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className='flex items-center justify-between p-2 hover:bg-accent rounded-md group'
                  >
                    <span className='flex-1'>{playlist.name}</span>
                    <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => handleDeletePlaylist(playlist.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-sm text-muted-foreground px-2'>
                  No playlists yet
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
