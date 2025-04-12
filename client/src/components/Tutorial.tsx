import { useState } from 'react';
import { useGameState } from '../lib/stores/useGameState';
import GameBoard from './GameBoard';

const Tutorial = () => {
  const { setGamePhase, startNewGame, tutorialCompleted } = useGameState();
  const [step, setStep] = useState(0);
  
  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Sword & Poker!",
      content: "In this game, you'll battle enemies by forming poker hands on a 5×5 grid. Let's learn the basics!",
      image: "https://images.unsplash.com/photo-1492256346876-6d277ea0c029"
    },
    {
      title: "Card Placement",
      content: "You must place cards adjacent to existing cards (horizontally, vertically, or diagonally). The first card is placed for you in the center.",
      image: "https://images.unsplash.com/photo-1532630174493-69e1fe9fead2"
    },
    {
      title: "Form Poker Hands",
      content: "Create poker hands to deal damage! The stronger the hand, the more damage you'll deal. Pairs deal 10 damage, while a Royal Flush deals a massive 200 damage!",
      image: "https://images.unsplash.com/photo-1524373050940-8f19e9b858a9"
    },
    {
      title: "Equipment",
      content: "Your sword affects how much damage you deal, and your shield reduces damage you take. You'll find better equipment as you progress.",
      image: "https://images.unsplash.com/photo-1440711085503-89d8ec455791"
    },
    {
      title: "Ready to Play?",
      content: "That's the basics! Are you ready to start your adventure through the dungeon?",
      image: "https://images.unsplash.com/photo-1594652634010-275456c808d0"
    }
  ];
  
  const currentStep = tutorialSteps[step];
  
  // Skip tutorial if already completed
  if (tutorialCompleted) {
    return <GameBoard />;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-800 to-blue-900 text-white">
      <div className="relative flex-1 flex items-center justify-center p-4">
        {/* Tutorial slide */}
        <div className="bg-white text-black rounded-xl overflow-hidden shadow-2xl max-w-md w-full">
          <img 
            src={currentStep.image} 
            alt={currentStep.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 text-blue-800">{currentStep.title}</h2>
            <p className="text-gray-700 mb-6">{currentStep.content}</p>
            
            <div className="flex justify-between items-center">
              <button 
                className={`px-4 py-2 rounded-lg ${step > 0 ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-400'}`}
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
              >
                Previous
              </button>
              
              {step < tutorialSteps.length - 1 ? (
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  onClick={() => setStep(step + 1)}
                >
                  Next
                </button>
              ) : (
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  onClick={() => {
                    startNewGame();
                  }}
                >
                  Start Game
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-black bg-opacity-50">
        <button 
          className="w-full py-3 bg-red-600 text-white rounded-lg"
          onClick={() => setGamePhase('menu')}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default Tutorial;
