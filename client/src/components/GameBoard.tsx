import { useEffect, useState } from 'react';
import { useGameState } from '../lib/stores/useGameState';
import { useEnemyAI } from '../lib/stores/useEnemyAI';
import { usePokerHands } from '../lib/stores/usePokerHands';
import { useAudio } from '../lib/stores/useAudio';
import Card from './Card';
import Player from './Player';
import Enemy from './Enemy';
import GameControls from './GameControls';
import HandEvaluation from './HandEvaluation';
import HealthBar from './HealthBar';
import { Card as CardType, Position } from '@shared/types';

const GameBoard = () => {
  const { battle, player, currentEnemy, placeCard, highlightValidMoves, clearHighlights, endBattle } = useGameState();
  const { makeMove } = useEnemyAI();
  const { findBestHand, calculateDamage } = usePokerHands();
  const { playHit, playSuccess } = useAudio();
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);

  // Initialize the battle if needed
  useEffect(() => {
    if (!battle?.board[2][2].card) {
      useGameState.getState().initializeBoard();
    }
  }, [battle]);

  // Handle enemy turn
  useEffect(() => {
    if (battle && !battle.playerTurn && !battle.isGameOver) {
      console.log("Enemy turn starting - battle turn count:", battle.turnCount);
      // Add a slight delay before enemy makes a move
      const timerId = setTimeout(() => {
        makeMove();
      }, 500);
      
      return () => clearTimeout(timerId);
    }
  }, [battle, makeMove]);

  // Check for game over conditions
  useEffect(() => {
    if (battle?.isGameOver) {
      if (battle.winner === 'player') {
        setShowVictory(true);
        playSuccess();
        setTimeout(() => {
          endBattle(true);
        }, 3000);
      } else if (battle.winner === 'enemy') {
        setShowDefeat(true);
        setTimeout(() => {
          endBattle(false);
        }, 3000);
      }
    }
  }, [battle, endBattle, playSuccess]);

  // Handle card selection
  const handleCardSelect = (card: CardType) => {
    if (!battle?.playerTurn || battle.isGameOver) return;
    
    setSelectedCard(card);
    highlightValidMoves(card);
  };

  // Handle card placement
  const handleCellClick = (position: Position) => {
    if (!battle?.playerTurn || !selectedCard || battle.isGameOver) return;
    
    // Check if the position is a valid move
    const isValidMove = battle.board[position.row][position.col].isValidMove;
    
    if (isValidMove) {
      playHit();
      placeCard(selectedCard, position);
      setSelectedCard(null);
      clearHighlights();
    }
  };

  // Render loading state if battle is not initialized
  if (!battle || !player || !currentEnemy) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-2xl font-bold">Loading battle...</div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden bg-background"
      style={{background: 'url(https://images.unsplash.com/photo-1524373050940-8f19e9b858a9) center/cover no-repeat'}}>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Game container */}
      <div className="relative z-10 flex flex-col h-full p-4">
        {/* Enemy section */}
        <div className="flex items-center justify-between mb-4">
          <Enemy enemy={currentEnemy} />
          <HealthBar 
            current={battle.enemyStats.currentHealth} 
            max={battle.enemyStats.maxHealth}
            type="enemy" 
          />
        </div>
        
        {/* Battle log - show latest hand played */}
        <div className="bg-black bg-opacity-60 text-white p-2 mb-4 rounded-lg text-sm">
          {battle.lastPlayerHand && (
            <div className="mb-1">
              You formed a {usePokerHands.getState().getHandName(battle.lastPlayerHand.type)} for {battle.lastPlayerHand.damage} damage!
            </div>
          )}
          {battle.lastEnemyHand && (
            <div>
              Enemy formed a {usePokerHands.getState().getHandName(battle.lastEnemyHand.type)} for {battle.lastEnemyHand.damage} damage!
            </div>
          )}
        </div>
        
        {/* Game board */}
        <div className="flex-1 flex justify-center items-center mb-4">
          <div className="grid grid-cols-5 gap-1 bg-black bg-opacity-30 p-2 rounded-lg">
            {battle.board.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-16 h-24 md:w-20 md:h-28 flex items-center justify-center rounded-md cursor-pointer
                    ${cell.isValidMove ? 'bg-green-500 bg-opacity-50' : 'bg-gray-800 bg-opacity-50'}
                    ${cell.isHighlighted ? 'ring-2 ring-yellow-400' : ''}`}
                  onClick={() => handleCellClick({ row: rowIndex, col: colIndex })}
                >
                  {cell.card ? (
                    <Card card={cell.card} size="md" onClick={() => {}} />
                  ) : null}
                </div>
              ))
            ))}
          </div>
        </div>
        
        {/* Player hand */}
        <div className="flex justify-center mb-4">
          <div className="flex space-x-2 overflow-x-auto py-2 px-4">
            {battle.playerHand.map((card) => (
              <Card 
                key={card.id} 
                card={card} 
                selected={selectedCard?.id === card.id}
                size="lg"
                onClick={() => handleCardSelect(card)} 
              />
            ))}
          </div>
        </div>
        
        {/* Player stats */}
        <div className="flex items-center justify-between mb-2">
          <Player player={player} />
          <HealthBar 
            current={battle.playerStats.currentHealth} 
            max={battle.playerStats.maxHealth} 
            type="player"
          />
        </div>
        
        {/* Game controls */}
        <GameControls 
          playerTurn={battle.playerTurn} 
          turnCount={battle.turnCount}
          onEndTurn={() => {
            clearHighlights();
            setSelectedCard(null);
          }}
        />
        
        {/* Victory/defeat overlays */}
        {showVictory && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Victory!</h2>
              <p className="mb-4">You defeated {currentEnemy.name}!</p>
              <div className="animate-bounce">
                <svg className="w-16 h-16 mx-auto text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {showDefeat && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Defeat!</h2>
              <p className="mb-4">You were defeated by {currentEnemy.name}!</p>
              <div className="animate-pulse">
                <svg className="w-16 h-16 mx-auto text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
