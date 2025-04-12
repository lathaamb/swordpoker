import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GamePhase, Player, Enemy, DungeonFloor, Card, Suit, CardValue, Position, GameBoard, GridCell, BattleState } from '@shared/types';
import { usePokerHands } from './usePokerHands';

// Helper function to get floor theme
const getFloorTheme = (level: number) => {
  const themes = [
    { name: 'Forest Outskirts', theme: 'forest' },
    { name: 'Ancient Caves', theme: 'cave' },
    { name: 'Crumbling Castle', theme: 'castle' },
    { name: 'Scorching Desert', theme: 'desert' },
    { name: 'Volcanic Summit', theme: 'volcano' },
    { name: 'Crystal Caverns', theme: 'crystal' },
    { name: 'Shadow Temple', theme: 'shadow' },
    { name: 'Frozen Peaks', theme: 'ice' }
  ];
  return themes[Math.min((level - 1) % themes.length, themes.length - 1)];
};

// Helper function to create an enemy based on level and type
const createEnemy = (level: number, type: 'basic' | 'elite' | 'boss'): Enemy => {
  const enemyTypes = {
    basic: {
      names: ['Goblin Scout', 'Forest Bandit', 'Cave Spider', 'Desert Raider', 'Flame Imp'],
      healthMod: 1.0,
      damageMod: 1.0,
      traits: [['Prefers pairs', 'Weak against flush'], ['Aggressive', 'Low defense'], ['Quick', 'Fragile']]
    },
    elite: {
      names: ['Orc Champion', 'Dark Magician', 'Stone Golem', 'Sand Wyrm', 'Lava Beast'],
      healthMod: 1.5,
      damageMod: 1.2,
      traits: [['Prefers straights', 'Strong defense'], ['Flush master', 'High damage'], ['Tactical', 'Resilient']]
    },
    boss: {
      names: ['Ancient Treant', 'Cave Overlord', 'Castle King', 'Desert Emperor', 'Volcano Dragon'],
      healthMod: 2.0,
      damageMod: 1.5,
      traits: [['Master strategist', 'Multiple phases'], ['Royal flush expert', 'Overwhelming power'], ['Ultimate defense', 'Special abilities']]
    }
  };

  const typeInfo = enemyTypes[type];
  const nameIndex = Math.floor(level / 2) % typeInfo.names.length;
  const traitIndex = level % typeInfo.traits.length;

  const baseHealth = 50 + (level * 15);
  const baseDamage = 0.8 + (level * 0.1);

  return {
    id: `${type}-${level}-${nameIndex}`,
    name: typeInfo.names[nameIndex],
    type,
    stats: {
      maxHealth: Math.floor(baseHealth * typeInfo.healthMod),
      currentHealth: Math.floor(baseHealth * typeInfo.healthMod),
      level: Math.ceil(level / 2),
      experience: 0,
      equipment: {
        weapon: {
          id: `enemy-weapon-${level}`,
          name: `${type === 'boss' ? 'Legendary' : type === 'elite' ? 'Elite' : 'Common'} Weapon`,
          type: type === 'boss' ? 'legendary' : type === 'elite' ? 'rare' : 'common',
          damageModifier: baseDamage * typeInfo.damageMod,
          effects: [],
          description: `A weapon wielded by ${typeInfo.names[nameIndex]}.`,
          iconUrl: 'https://images.unsplash.com/photo-1602524815375-a54449bb00fb'
        },
        shield: type !== 'basic' ? {
          id: `enemy-shield-${level}`,
          name: `${type === 'boss' ? 'Legendary' : 'Elite'} Shield`,
          type: type === 'boss' ? 'heavy' : 'medium',
          damageReduction: type === 'boss' ? 0.3 : 0.2,
          effects: [],
          description: `A shield carried by ${typeInfo.names[nameIndex]}.`,
          iconUrl: 'https://images.unsplash.com/photo-1717568008314-ac8a706c382c'
        } : null
      }
    },
    description: `A level ${level} ${type} enemy from the dungeon depths.`,
    traits: typeInfo.traits[traitIndex],
    abilities: type === 'boss' ? ['Phase shift', 'Special attack'] : type === 'elite' ? ['Power move'] : [],
    avatarUrl: 'https://images.unsplash.com/photo-1626177346490-11963d8d5df9'
  };
};

// Helper function to create a dungeon floor
const createDungeonFloor = (level: number): DungeonFloor => {
  const { name, theme } = getFloorTheme(level);
  const isBossFloor = level % 5 === 0;
  const numRooms = Math.min(5 + Math.floor(level / 2), 12); // More rooms as levels progress
  
  const rooms: DungeonRoom[] = [];
  
  // Create entrance
  rooms.push({
    id: 'entrance',
    type: 'battle',
    difficulty: level,
    completed: false,
    enemies: [createEnemy(level, 'basic')],
    position: { x: 0, y: 0 },
    connections: ['treasure-1']
  });

  // Add rest room if it's a boss floor
  if (isBossFloor) {
    rooms.push({
      id: 'rest',
      type: 'rest',
      difficulty: 0,
      completed: false,
      position: { x: 1, y: 1 },
      connections: ['entrance', 'pre-boss']
    });
  }

  // Add treasure and battle rooms
  for (let i = 1; i < numRooms - 1; i++) {
    const isShop = i % 3 === 0;
    const roomId = isShop ? `shop-${i}` : i % 2 === 0 ? `battle-${i}` : `treasure-${i}`;
    rooms.push({
      id: roomId,
      type: isShop ? 'shop' : i % 2 === 0 ? 'battle' : 'treasure',
      difficulty: level + Math.floor(i / 2),
      completed: false,
      enemies: i % 2 === 0 ? [createEnemy(level + Math.floor(i / 2), 'elite')] : undefined,
      position: { 
        x: (i % 3) * 2,
        y: Math.floor(i / 3) * 2
      },
      connections: [i === 1 ? 'entrance' : `${i % 2 === 0 ? 'battle' : 'treasure'}-${i-1}`]
    });
  }

  // Add boss room for every 5th floor
  if (isBossFloor) {
    rooms.push({
      id: 'boss',
      type: 'battle',
      difficulty: level + 3,
      completed: false,
      enemies: [createEnemy(level + 3, 'boss')],
      position: { x: 3, y: 3 },
      connections: ['pre-boss']
    });
  }

  return {
    id: level,
    name: `${name} - Level ${level}`,
    theme,
    rooms,
    completed: false,
    bossDefeated: false
  };
};

interface GameState {
  gamePhase: GamePhase;
  player: Player | null;
  currentEnemy: Enemy | null;
  currentFloor: DungeonFloor | null;
  battle: BattleState | null;
  tutorialCompleted: boolean;
  availableCards: Card[];
  dungeonLevel: number;
  
  // Game phase actions
  setGamePhase: (phase: GamePhase) => void;
  startNewGame: () => void;
  startTutorial: () => void;
  startBattle: (enemy: Enemy) => void;
  endBattle: (won: boolean) => void;
  
  // Battle actions
  placeCard: (card: Card, position: Position) => void;
  drawCard: () => Card | null;
  endTurn: () => void;
  
  // Board actions
  initializeBoard: () => void;
  getValidMoves: (card: Card) => Position[];
  highlightValidMoves: (card: Card) => void;
  clearHighlights: () => void;
  
  // Equipment and inventory
  equipWeapon: (weaponId: string) => void;
  equipShield: (shieldId: string) => void;
  useConsumable: (consumableId: string) => void;
  
  // Game progression
  gainExperience: (amount: number) => void;
  gainGold: (amount: number) => void;
  proceedToNextLevel: () => void;
  
  // Reset game
  resetGame: () => void;
}

// Helper function to create a standard deck of cards
const createDeck = (): Card[] => {
  const deck: Card[] = [];
  const suits = Object.values(Suit);
  
  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        id: `${suit}-${value}`,
        suit: suit as Suit,
        value: value as CardValue,
        faceUp: true
      });
    }
  }
  
  return shuffleDeck(deck);
};

// Helper function to shuffle a deck of cards
const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// Helper function to create an empty game board
const createEmptyBoard = (): GameBoard => {
  const board: GameBoard = [];
  
  for (let row = 0; row < 5; row++) {
    const rowCells: GridCell[] = [];
    for (let col = 0; col < 5; col++) {
      rowCells.push({
        position: { row, col },
        card: null,
        isHighlighted: false,
        isValidMove: false
      });
    }
    board.push(rowCells);
  }
  
  return board;
};

// Initial player stats
const createInitialPlayer = (): Player => ({
  id: '1',
  name: 'Hero',
  stats: {
    maxHealth: 100,
    currentHealth: 100,
    level: 1,
    experience: 0,
    equipment: {
      weapon: {
        id: 'basic-sword',
        name: 'Basic Sword',
        type: 'common',
        damageModifier: 1.0,
        effects: [],
        description: 'A simple but reliable sword.',
        iconUrl: 'https://images.unsplash.com/photo-1440711085503-89d8ec455791'
      },
      shield: {
        id: 'basic-shield',
        name: 'Wooden Shield',
        type: 'light',
        damageReduction: 0.1,
        effects: [],
        description: 'A simple wooden shield that offers basic protection.',
        iconUrl: 'https://images.unsplash.com/photo-1717568008314-ac8a706c382c'
      }
    }
  },
  inventory: [],
  gold: 50,
  avatarUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65'
});

// Basic enemy template (for tutorial)
const createBasicEnemy = (): Enemy => ({
  id: 'goblin-1',
  name: 'Goblin Rogue',
  type: 'basic',
  stats: {
    maxHealth: 60,
    currentHealth: 60,
    level: 1,
    experience: 0,
    equipment: {
      weapon: {
        id: 'rusty-dagger',
        name: 'Rusty Dagger',
        type: 'common',
        damageModifier: 0.8,
        effects: [],
        description: 'A well-used rusty dagger.',
        iconUrl: 'https://images.unsplash.com/photo-1717436426528-1d7fe52162b0'
      },
      shield: null
    }
  },
  description: 'A sneaky goblin who loves to gamble with cards.',
  traits: ['Prefers pairs', 'Weak against flush'],
  abilities: [],
  avatarUrl: 'https://images.unsplash.com/photo-1548445929-4f60a497f851'
});

// Create first dungeon floor
const createFirstDungeonFloor = (): DungeonFloor => ({
  id: 1,
  name: 'Forest Outskirts',
  theme: 'forest',
  rooms: [
    {
      id: 'start',
      type: 'battle',
      difficulty: 1,
      completed: false,
      enemies: [createBasicEnemy()],
      position: { x: 0, y: 0 },
      connections: ['treasure-1']
    },
    {
      id: 'treasure-1',
      type: 'treasure',
      difficulty: 0,
      completed: false,
      treasures: [],
      position: { x: 1, y: 1 },
      connections: ['start', 'battle-2']
    },
    {
      id: 'battle-2',
      type: 'battle',
      difficulty: 2,
      completed: false,
      enemies: [],
      position: { x: 2, y: 0 },
      connections: ['treasure-1', 'boss']
    },
    {
      id: 'boss',
      type: 'battle',
      difficulty: 5,
      completed: false,
      enemies: [],
      position: { x: 3, y: 1 },
      connections: ['battle-2']
    }
  ],
  completed: false,
  bossDefeated: false
});

// Initial battle state
const createInitialBattleState = (player: Player, enemy: Enemy): BattleState => {
  const deck = createDeck();
  const playerHand = deck.splice(0, 5);
  
  return {
    playerTurn: true,
    board: createEmptyBoard(),
    playerHand,
    playerStats: { ...player.stats },
    enemyStats: { ...enemy.stats },
    lastPlayerHand: null,
    lastEnemyHand: null,
    turnCount: 1,
    isGameOver: false,
    winner: null
  };
};

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      gamePhase: 'menu',
      player: null,
      currentEnemy: null,
      currentFloor: null,
      battle: null,
      tutorialCompleted: false,
      availableCards: [],
      dungeonLevel: 1,
      
      setGamePhase: (phase) => set({ gamePhase: phase }),
      
      startNewGame: () => {
        const player = createInitialPlayer();
        const firstFloor = createFirstDungeonFloor();
        
        set({
          gamePhase: 'dungeon_map',
          player,
          currentFloor: firstFloor,
          availableCards: createDeck()
        });
      },
      
      startTutorial: () => {
        const player = createInitialPlayer();
        const enemy = createBasicEnemy();
        
        set({
          gamePhase: 'tutorial',
          player,
          currentEnemy: enemy,
          availableCards: createDeck()
        });
      },
      
      startBattle: (enemy) => {
        const { player } = get();
        if (!player) return;
        
        const battleState = createInitialBattleState(player, enemy);
        
        set({
          gamePhase: 'battle',
          currentEnemy: enemy,
          battle: battleState
        });
      },
      
      endBattle: (won) => {
        const { player, currentEnemy, currentFloor, battle } = get();
        if (!player || !currentEnemy) return;
        
        if (won) {
          // Give rewards
          const experienceGained = currentEnemy.stats.level * 10;
          const goldGained = currentEnemy.stats.level * 15;
          
          // Update player
          set({
            player: {
              ...player,
              stats: {
                ...player.stats,
                currentHealth: Math.min(
                  player.stats.currentHealth + 20,
                  player.stats.maxHealth
                )
              },
              gold: player.gold + goldGained
            }
          });
          
          get().gainExperience(experienceGained);
          
          // Progress to the next level when any enemy is defeated
          // Slight delay to show the victory message before advancing
          setTimeout(() => {
            console.log("Proceeding to next level after defeating enemy");
            get().proceedToNextLevel();
          }, 1500);
            
          return; // Exit early as proceedToNextLevel will handle the game state transition
        }
        
        // Normal battle end
        set({
          gamePhase: 'dungeon_map',
          currentEnemy: null,
          battle: null
        });
      },
      
      placeCard: (card, position) => {
        const { battle } = get();
        // Import from the module directly
        const { findBestHand, calculateDamage } = usePokerHands.getState();
        
        if (!battle || !battle.playerTurn) return;
        
        // Check if the move is valid
        const validMoves = get().getValidMoves(card);
        const isValidMove = validMoves.some(
          (move) => move.row === position.row && move.col === position.col
        );
        
        if (!isValidMove) return;
        
        // Place the card
        const newBoard = [...battle.board];
        newBoard[position.row][position.col] = {
          ...newBoard[position.row][position.col],
          card,
          isHighlighted: false,
          isValidMove: false
        };
        
        // Remove card from player's hand
        const newHand = battle.playerHand.filter((c) => c.id !== card.id);
        
        // Draw a new card
        const newCard = get().drawCard();
        if (newCard) {
          newHand.push(newCard);
        }
        
        // Evaluate potential poker hand
        const pokerHand = findBestHand(
          newBoard.map(row => row.map(cell => cell.card))
        );
        
        // Calculate damage if a hand was formed
        let damageDealt = 0;
        if (pokerHand) {
          const weaponModifier = battle.playerStats.equipment.weapon?.damageModifier || 1;
          damageDealt = calculateDamage(pokerHand, weaponModifier);
          
          // Update enemy health
          const newEnemyStats = {
            ...battle.enemyStats,
            currentHealth: Math.max(0, battle.enemyStats.currentHealth - damageDealt)
          };
          
          // Check if enemy's health reached 0
          if (newEnemyStats.currentHealth <= 0) {
            // Game over, player wins
            console.log("Enemy defeated - game over");
            set({
              battle: {
                ...battle,
                board: newBoard,
                playerHand: newHand,
                enemyStats: newEnemyStats,
                lastPlayerHand: pokerHand,
                isGameOver: true,
                winner: 'player'
              }
            });
            
            // Automatically end battle with a win after a short delay
            // This will trigger the level progression logic if applicable
            setTimeout(() => {
              get().endBattle(true);
            }, 2000);
          } else {
            // Update battle state with damage and automatically end turn
            set({
              battle: {
                ...battle,
                board: newBoard,
                playerHand: newHand,
                enemyStats: newEnemyStats,
                lastPlayerHand: pokerHand,
                playerTurn: false // Automatically end the player's turn
              }
            });
            
            // Add a small delay for the player to see their move's effect before enemy moves
            setTimeout(() => {
              console.log("Automatically ending player turn after move");
              // No need to call endTurn directly as we've already set playerTurn: false
            }, 1000);
          }
        } else {
          // Update battle state without damage and automatically end turn
          set({
            battle: {
              ...battle,
              board: newBoard,
              playerHand: newHand,
              lastPlayerHand: null,
              playerTurn: false // Automatically end the player's turn
            }
          });
          
          // Add a small delay for the player to see their move before enemy moves
          setTimeout(() => {
            console.log("Automatically ending player turn with no hand formed");
          }, 1000);
        }
      },
      
      drawCard: () => {
        const { availableCards } = get();
        if (availableCards.length === 0) return null;
        
        const newAvailableCards = [...availableCards];
        const drawnCard = newAvailableCards.shift();
        
        set({ availableCards: newAvailableCards });
        
        return drawnCard || null;
      },
      
      endTurn: () => {
        const { battle, currentEnemy } = get();
        if (!battle || !currentEnemy) return;
        
        // Check if the game is over
        if (battle.playerStats.currentHealth <= 0) {
          set({
            battle: {
              ...battle,
              isGameOver: true,
              winner: 'enemy'
            }
          });
          return;
        }
        
        if (battle.enemyStats.currentHealth <= 0) {
          set({
            battle: {
              ...battle,
              isGameOver: true,
              winner: 'player'
            }
          });
          return;
        }
        
        // If the player is ending their turn, switch to enemy turn
        if (battle.playerTurn) {
          set({
            battle: {
              ...battle,
              playerTurn: false,
              turnCount: battle.turnCount + 1
            }
          });
        } else {
          // If the enemy is ending their turn, switch to player turn
          set({
            battle: {
              ...battle,
              playerTurn: true,
              turnCount: battle.turnCount + 1
            }
          });
        }
      },
      
      initializeBoard: () => {
        const board = createEmptyBoard();
        
        // Place an initial card in the center
        const centerCard = get().drawCard();
        if (centerCard) {
          board[2][2] = {
            ...board[2][2],
            card: centerCard
          };
        }
        
        const { battle } = get();
        if (battle) {
          set({
            battle: {
              ...battle,
              board
            }
          });
        }
      },
      
      getValidMoves: (card) => {
        const { battle } = get();
        if (!battle) return [];
        
        const validMoves: Position[] = [];
        const board = battle.board;
        
        // Function to check if a cell is adjacent to an existing card
        const isAdjacentToCard = (row: number, col: number): boolean => {
          const adjacentPositions = [
            { row: row - 1, col: col - 1 },
            { row: row - 1, col },
            { row: row - 1, col: col + 1 },
            { row, col: col - 1 },
            { row, col: col + 1 },
            { row: row + 1, col: col - 1 },
            { row: row + 1, col },
            { row: row + 1, col: col + 1 }
          ];
          
          return adjacentPositions.some(pos => {
            const r = pos.row;
            const c = pos.col;
            return (
              r >= 0 && r < 5 && c >= 0 && c < 5 && board[r][c].card !== null
            );
          });
        };
        
        // Check all empty cells
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            if (board[row][col].card === null && isAdjacentToCard(row, col)) {
              validMoves.push({ row, col });
            }
          }
        }
        
        return validMoves;
      },
      
      highlightValidMoves: (card) => {
        const { battle } = get();
        if (!battle) return;
        
        const validMoves = get().getValidMoves(card);
        const newBoard = [...battle.board];
        
        // Clear previous highlights
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            newBoard[row][col] = {
              ...newBoard[row][col],
              isHighlighted: false,
              isValidMove: false
            };
          }
        }
        
        // Highlight valid moves
        for (const move of validMoves) {
          newBoard[move.row][move.col] = {
            ...newBoard[move.row][move.col],
            isHighlighted: true,
            isValidMove: true
          };
        }
        
        set({
          battle: {
            ...battle,
            board: newBoard
          }
        });
      },
      
      clearHighlights: () => {
        const { battle } = get();
        if (!battle) return;
        
        const newBoard = [...battle.board];
        
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 5; col++) {
            newBoard[row][col] = {
              ...newBoard[row][col],
              isHighlighted: false,
              isValidMove: false
            };
          }
        }
        
        set({
          battle: {
            ...battle,
            board: newBoard
          }
        });
      },
      
      equipWeapon: (weaponId) => {
        const { player } = get();
        if (!player) return;
        
        const weapon = player.inventory.find(
          item => 'damageModifier' in item && item.id === weaponId
        );
        
        if (weapon && 'damageModifier' in weapon) {
          set({
            player: {
              ...player,
              stats: {
                ...player.stats,
                equipment: {
                  ...player.stats.equipment,
                  weapon
                }
              },
              inventory: player.inventory.filter(item => item.id !== weaponId)
            }
          });
        }
      },
      
      equipShield: (shieldId) => {
        const { player } = get();
        if (!player) return;
        
        const shield = player.inventory.find(
          item => 'damageReduction' in item && item.id === shieldId
        );
        
        if (shield && 'damageReduction' in shield) {
          set({
            player: {
              ...player,
              stats: {
                ...player.stats,
                equipment: {
                  ...player.stats.equipment,
                  shield
                }
              },
              inventory: player.inventory.filter(item => item.id !== shieldId)
            }
          });
        }
      },
      
      useConsumable: (consumableId) => {
        const { player, battle } = get();
        if (!player || !battle) return;
        
        const consumable = player.inventory.find(
          item => 'effect' in item && item.id === consumableId
        );
        
        if (consumable && 'effect' in consumable) {
          // Apply the consumable effect
          consumable.effect(get());
          
          // Remove one from quantity or remove if last one
          const updatedInventory = [...player.inventory];
          const itemIndex = updatedInventory.findIndex(item => item.id === consumableId);
          
          if (itemIndex !== -1 && 'quantity' in updatedInventory[itemIndex]) {
            if (updatedInventory[itemIndex].quantity > 1) {
              // @ts-ignore - We've checked that quantity exists
              updatedInventory[itemIndex].quantity -= 1;
            } else {
              updatedInventory.splice(itemIndex, 1);
            }
          }
          
          set({
            player: {
              ...player,
              inventory: updatedInventory
            }
          });
        }
      },
      
      gainExperience: (amount) => {
        const { player } = get();
        if (!player) return;
        
        const newExperience = player.stats.experience + amount;
        const expForNextLevel = player.stats.level * 100;
        
        if (newExperience >= expForNextLevel) {
          // Level up!
          set({
            player: {
              ...player,
              stats: {
                ...player.stats,
                level: player.stats.level + 1,
                experience: newExperience - expForNextLevel,
                maxHealth: player.stats.maxHealth + 10,
                currentHealth: player.stats.maxHealth + 10 // Restore health on level up
              }
            }
          });
        } else {
          // Just add experience
          set({
            player: {
              ...player,
              stats: {
                ...player.stats,
                experience: newExperience
              }
            }
          });
        }
      },
      
      gainGold: (amount) => {
        const { player } = get();
        if (!player) return;
        
        set({
          player: {
            ...player,
            gold: player.gold + amount
          }
        });
      },
      
      proceedToNextLevel: () => {
        const { dungeonLevel, player, currentFloor } = get();
        if (!player) return;
        
        // Ensure we transition to the next level even if we're in battle
        const currentPhase = get().gamePhase;
        if (currentPhase === 'battle') {
          // End the current battle before proceeding
          set({ 
            battle: null,
            currentEnemy: null
          });
        }
        
        console.log(`Proceeding to next level after defeating enemy`);
        
        // Create a new dungeon floor with more varied room positions
        const newLevel = dungeonLevel + 1; // Store this for consistent usage
        const newFloor = createDungeonFloor(newLevel);
        
        // Heal the player and award some gold for the next level
        const updatedPlayer = {
          ...player,
          stats: {
            ...player.stats,
            currentHealth: Math.min(
              player.stats.currentHealth + 30,
              player.stats.maxHealth
            )
          },
          gold: player.gold + (newLevel * 10) // Award gold for completing a level
        };
        
        // Update game state with new level
        set({
          dungeonLevel: newLevel,
          player: updatedPlayer,
          currentFloor: newFloor,
          availableCards: createDeck(), // Fresh deck for the new level
          gamePhase: 'dungeon_map' // Ensure we go to the dungeon map
        });
        
        console.log(`Advanced to dungeon level ${newLevel}`);
      },
      
      resetGame: () => {
        set({
          gamePhase: 'menu',
          player: null,
          currentEnemy: null,
          currentFloor: null,
          battle: null,
          availableCards: [],
          dungeonLevel: 1
        });
      }
    }),
    {
      name: 'sword-poker-game-state'
    }
  )
);
