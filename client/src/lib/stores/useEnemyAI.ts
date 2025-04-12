import { create } from 'zustand';
import { useGameState } from './useGameState';
import { usePokerHands } from './usePokerHands';
import { Card, Position, PlacedCard, Enemy } from '@shared/types';

interface EnemyAIState {
  makeMove: () => void;
  evaluateBoard: () => { position: Position; card: Card } | null;
  calculateBestMove: (enemy: Enemy) => { position: Position; card: Card } | null;
}

export const useEnemyAI = create<EnemyAIState>((set, get) => ({
  makeMove: () => {
    const gameState = useGameState.getState();
    const { findBestHand, calculateDamage } = usePokerHands.getState();
    
    const { battle, currentEnemy } = gameState;
    if (!battle || !currentEnemy || battle.playerTurn || battle.isGameOver) {
      console.log("Enemy AI cannot make a move - conditions not met");
      return;
    }
    
    // Simulate "thinking" time for the AI
    setTimeout(() => {
      try {
        console.log("Enemy AI is making a move...");
        const move = get().calculateBestMove(currentEnemy);
        
        if (move && move.position && typeof move.position.row !== 'undefined') {
          const { position, card } = move;
          console.log("Enemy making move at position:", position, "with card:", card);
          
          // Update the board with the AI's move
          const newBoard = [...battle.board];
          
          // Safety check for valid position
          if (position.row < 0 || position.row >= 5 || position.col < 0 || position.col >= 5) {
            console.error("Enemy tried to place card at invalid position:", position);
            useGameState.setState({
              battle: {
                ...battle,
                playerTurn: true
              }
            });
            return;
          }
          
          newBoard[position.row][position.col] = {
            ...newBoard[position.row][position.col],
            card,
            isHighlighted: false,
            isValidMove: false
          };
          
          // Evaluate potential hands formed by this move
          const newHand = findBestHand(
            newBoard.map(row => row.map(cell => cell.card))
          );
          
          console.log("Enemy formed hand:", newHand);
          
          // Calculate damage if a hand was formed
          let damageDealt = 0;
          if (newHand) {
            const weaponModifier = currentEnemy.stats.equipment.weapon?.damageModifier || 1;
            damageDealt = calculateDamage(newHand, weaponModifier);
            
            // Apply damage to player
            const playerShield = gameState.player?.stats.equipment.shield;
            const damageReduction = playerShield?.damageReduction || 0;
            const reducedDamage = Math.max(1, Math.floor(damageDealt * (1 - damageReduction)));
            
            console.log("Enemy dealing damage:", reducedDamage);
            
            // Update player health
            const newPlayerStats = {
              ...battle.playerStats,
              currentHealth: Math.max(0, battle.playerStats.currentHealth - reducedDamage)
            };
            
            // Check if player's health reached 0
            if (newPlayerStats.currentHealth <= 0) {
              // Game over, enemy wins
              useGameState.setState({
                battle: {
                  ...battle,
                  board: newBoard,
                  playerStats: newPlayerStats,
                  lastEnemyHand: newHand,
                  isGameOver: true,
                  winner: 'enemy'
                }
              });
              console.log("Game over - player defeated");
            } else {
              // Update battle state
              useGameState.setState({
                battle: {
                  ...battle,
                  board: newBoard,
                  playerStats: newPlayerStats,
                  lastEnemyHand: newHand,
                  playerTurn: true
                }
              });
            }
          } else {
            // No hand formed, just update the board and switch turns
            useGameState.setState({
              battle: {
                ...battle,
                board: newBoard,
                lastEnemyHand: null,
                playerTurn: true
              }
            });
          }
        } else {
          console.log("Enemy AI couldn't find a valid move");
          // No valid moves, end turn
          useGameState.setState({
            battle: {
              ...battle,
              playerTurn: true
            }
          });
        }
      } catch (error) {
        console.error("Error during enemy move:", error);
        // If there's an error, just switch to player's turn
        useGameState.setState({
          battle: {
            ...battle,
            playerTurn: true
          }
        });
      }
    }, 1000);
  },
  
  evaluateBoard: () => {
    const gameState = useGameState.getState();
    const { battle } = gameState;
    
    if (!battle) {
      console.log("No battle state found");
      return null;
    }
    
    // Create a virtual deck for the enemy
    const availableCards = createVirtualDeck();
    if (availableCards.length === 0) {
      console.log("No available cards for enemy");
      return null;
    }
    
    // Try different cards until we find one with valid moves
    let validCard = null;
    let validMoves = null;
    
    // Shuffle the cards to try them in random order
    const shuffledCards = shuffleDeck(availableCards).slice(0, 10); // Try up to 10 cards
    
    for (const card of shuffledCards) {
      const moves = gameState.getValidMoves(card);
      if (moves && moves.length > 0) {
        validCard = card;
        validMoves = moves;
        break;
      }
    }
    
    if (!validCard || !validMoves || validMoves.length === 0) {
      console.log("No valid moves found for any enemy card");
      return null;
    }
    
    // Choose a random position from valid moves
    const randomMoveIndex = Math.floor(Math.random() * validMoves.length);
    const position = validMoves[randomMoveIndex];
    
    // Safety check to ensure we have a valid position
    if (!position || typeof position.row === 'undefined') {
      console.log("Invalid position selected for enemy", position);
      return null;
    }
    
    console.log("Enemy selected card:", validCard, "to place at position:", position);
    return { position, card: validCard };
  },
  
  calculateBestMove: (enemy) => {
    // For more complex AI, we would evaluate different cards and positions
    // based on the enemy's traits and the current board state
    // For now, we'll use a simple random strategy
    return get().evaluateBoard();
  }
}));

// Helper function to create a virtual deck for the enemy
function createVirtualDeck(): Card[] {
  const deck: Card[] = [];
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  
  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        id: `enemy-${suit}-${value}`,
        suit: suit as any,
        value: value as any,
        faceUp: true
      });
    }
  }
  
  // Shuffle the deck
  return shuffleDeck(deck);
}

// Helper function to shuffle a deck
function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}
