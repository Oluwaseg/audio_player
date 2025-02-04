import { Sidebar } from '@/components/sidebar/sidebar';
import { AudioPlayer } from '@/components/player/audio-player';

export default function Home() {
  return (
    <div className="border-b">
      <div className="flex h-screen">
        <Sidebar className="border-r" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Welcome to Soundwave</h1>
            <p className="text-muted-foreground">
              Upload your music or create a playlist to get started
            </p>
          </div>
        </main>
        <AudioPlayer />
      </div>
    </div>
  );
}