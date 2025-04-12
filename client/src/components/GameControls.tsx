import { useGameState } from '../lib/stores/useGameState';

interface GameControlsProps {
  playerTurn: boolean;
  turnCount: number;
  onEndTurn: () => void;
}

const GameControls = ({ playerTurn, turnCount, onEndTurn }: GameControlsProps) => {
  const { battle, setGamePhase, resetGame } = useGameState();
  
  if (!battle) return null;
  
  return (
    <div className="bg-black bg-opacity-70 p-3 rounded-lg flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <button 
          className="bg-red-500 text-white p-2 rounded-lg flex items-center"
          onClick={() => {
            if (confirm('Are you sure you want to exit the battle?')) {
              setGamePhase('dungeon_map');
            }
          }}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit
        </button>
        
        <div className="text-white text-sm">
          Turn: {turnCount}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className={`px-3 py-1 rounded-lg ${playerTurn ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'}`}>
          {playerTurn ? 'Your Turn' : 'Enemy Turn'}
        </div>
        
        {playerTurn && (
          <button 
            className="bg-blue-500 text-white p-2 rounded-lg flex items-center"
            onClick={() => {
              console.log("User clicked End Turn button");
              onEndTurn();
              useGameState.getState().endTurn();
            }}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            End Turn
          </button>
        )}
      </div>
    </div>
  );
};

export default GameControls;
