import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useAudio } from "./lib/stores/useAudio";
import { useGameState } from "./lib/stores/useGameState";
import MainMenu from "./components/MainMenu";
import GameBoard from "./components/GameBoard";
import Tutorial from "./components/Tutorial";
import DungeonMap from "./components/DungeonMap";
import ProfilePage from "./components/ProfilePage";
import MarketplacePage from "./components/MarketplacePage";
import "@fontsource/inter";
import { Howl } from "howler";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { gamePhase, setGamePhase } = useGameState();
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  
  // Preload assets
  useEffect(() => {
    // Load sounds
    const backgroundMusic = new Howl({
      src: ['/sounds/background.mp3'],
      loop: true,
      volume: 0.4,
      autoplay: true,
    });
    
    const hitSound = new Howl({
      src: ['/sounds/hit.mp3'],
      volume: 0.5,
    });
    
    const successSound = new Howl({
      src: ['/sounds/success.mp3'],
      volume: 0.6,
    });
    
    // Set the sounds in the store
    setBackgroundMusic(backgroundMusic);
    setHitSound(hitSound);
    setSuccessSound(successSound);
    
    // Start playing the background music
    backgroundMusic.play();
    
    // Simulate loading time for other assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => {
      clearTimeout(timer);
      backgroundMusic.unload();
      hitSound.unload();
      successSound.unload();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);
  
  // Determine which component to render based on game phase
  const renderGameComponent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
          <h1 className="text-3xl font-bold mb-4">Loading...</h1>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    console.log("Current game phase:", gamePhase);
    
    switch (gamePhase) {
      case 'menu':
        return <MainMenu />;
      case 'tutorial':
        return <Tutorial />;
      case 'dungeon_map':
        return <DungeonMap />;
      case 'battle':
        return <GameBoard />;
      case 'profile':
        return <ProfilePage />;
      case 'marketplace':
        return <MarketplacePage />;
      case 'game_over':
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-5xl font-bold mb-8">Game Over</h1>
            <p className="text-xl mb-8">Your adventure has ended...</p>
            <button 
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              onClick={() => setGamePhase('menu')}
            >
              Return to Main Menu
            </button>
          </div>
        );
      default:
        return <MainMenu />;
    }
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-full bg-background text-foreground overflow-hidden">
        {renderGameComponent()}
      </div>
    </QueryClientProvider>
  );
}

export default App;
