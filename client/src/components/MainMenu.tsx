import { useState, useEffect } from 'react';
import { useGameState } from '../lib/stores/useGameState';
import { useAudio } from '../lib/stores/useAudio';

const MainMenu = () => {
  const { startNewGame, startTutorial, setGamePhase } = useGameState();
  const { toggleMute, isMuted, backgroundMusic } = useAudio();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Start background music
  useEffect(() => {
    if (backgroundMusic && !isFirstLoad && !isMuted) {
      backgroundMusic.play();
    }
    
    return () => {
      if (backgroundMusic) {
        backgroundMusic.stop();
      }
    };
  }, [isFirstLoad, isMuted, backgroundMusic]);
  
  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-50"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42)' }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Title */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-2 tracking-wide">
              SWORD
              <svg className="w-12 h-12 inline-block mx-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
              </svg>
              POKER
            </h1>
            <p className="text-gray-300 text-xl">A Card Battle Adventure</p>
          </div>
          
          <div className="w-full max-w-md space-y-4">
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 flex items-center justify-center"
              onClick={() => {
                setIsFirstLoad(false);
                startNewGame();
              }}
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              New Game
            </button>
            
            <button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 transform hover:scale-105 flex items-center justify-center"
              onClick={() => {
                setIsFirstLoad(false);
                startTutorial();
              }}
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Tutorial
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 flex justify-between items-center">
          <div className="text-white text-sm">v1.0.0</div>
          
          <button 
            className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            onClick={toggleMute}
          >
            {isMuted ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
