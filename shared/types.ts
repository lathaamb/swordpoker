// Game phases
export type GamePhase = 'menu' | 'tutorial' | 'dungeon_map' | 'battle' | 'game_over' | 'profile' | 'marketplace';

// Card suits
export enum Suit {
  Hearts = 'hearts',
  Diamonds = 'diamonds',
  Clubs = 'clubs',
  Spades = 'spades'
}

// Card values
export enum CardValue {
  Ace = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
  Nine = 9,
  Ten = 10,
  Jack = 11,
  Queen = 12,
  King = 13
}

// Card representation
export interface Card {
  id: string;
  suit: Suit;
  value: CardValue;
  faceUp: boolean;
}

// Position on the game board
export interface Position {
  row: number;
  col: number;
}

// Placed card on the board
export interface PlacedCard extends Card {
  position: Position;
}

// Grid cell
export interface GridCell {
  position: Position;
  card: Card | null;
  isHighlighted: boolean;
  isValidMove: boolean;
}

// Game board
export type GameBoard = GridCell[][];

// Poker hand types
export enum PokerHandType {
  HighCard = 'highCard',
  Pair = 'pair',
  TwoPair = 'twoPair',
  ThreeOfAKind = 'threeOfAKind',
  Straight = 'straight',
  Flush = 'flush',
  FullHouse = 'fullHouse',
  FourOfAKind = 'fourOfAKind',
  StraightFlush = 'straightFlush',
  RoyalFlush = 'royalFlush'
}

// Poker hand with cards
export interface PokerHand {
  type: PokerHandType;
  cards: Card[];
  damage: number;
}

// Character equipment slots
export interface Equipment {
  weapon: Weapon | null;
  shield: Shield | null;
}

// Weapon types
export interface Weapon {
  id: string;
  name: string;
  type: 'common' | 'uncommon' | 'rare' | 'legendary';
  damageModifier: number;
  effects: WeaponEffect[];
  description: string;
  iconUrl: string;
}

// Shield types
export interface Shield {
  id: string;
  name: string;
  type: 'light' | 'medium' | 'heavy';
  damageReduction: number;
  effects: ShieldEffect[];
  description: string;
  iconUrl: string;
}

// Weapon effects
export type WeaponEffect = {
  type: 'damageBonus' | 'elementalDamage' | 'statusEffect';
  condition?: PokerHandType | Suit;
  value: number;
  description: string;
}

// Shield effects
export type ShieldEffect = {
  type: 'damageReduction' | 'reflection' | 'statusResistance';
  value: number;
  description: string;
}

// Character stats
export interface CharacterStats {
  maxHealth: number;
  currentHealth: number;
  level: number;
  experience: number;
  equipment: Equipment;
}

// Enemy data
export interface Enemy {
  id: string;
  name: string;
  type: 'basic' | 'elite' | 'miniBoss' | 'boss';
  stats: CharacterStats;
  description: string;
  traits: string[];
  abilities: EnemyAbility[];
  avatarUrl: string;
}

// Enemy ability
export interface EnemyAbility {
  name: string;
  description: string;
  effect: (gameState: any) => void;
  cooldown: number;
  currentCooldown: number;
}

// Player data
export interface Player {
  id: string;
  name: string;
  stats: CharacterStats;
  inventory: InventoryItem[];
  gold: number;
  avatarUrl: string;
}

// Inventory item
export type InventoryItem = Weapon | Shield | Consumable;

// Consumable items
export interface Consumable {
  id: string;
  name: string;
  type: 'healthPotion' | 'cardManipulation' | 'special';
  effect: (gameState: any) => void;
  description: string;
  iconUrl: string;
  quantity: number;
}

// Battle state
export interface BattleState {
  playerTurn: boolean;
  board: GameBoard;
  playerHand: Card[];
  playerStats: CharacterStats;
  enemyStats: CharacterStats;
  lastPlayerHand: PokerHand | null;
  lastEnemyHand: PokerHand | null;
  turnCount: number;
  isGameOver: boolean;
  winner: 'player' | 'enemy' | null;
}

// Dungeon floor
export interface DungeonFloor {
  id: number;
  name: string;
  theme: string;
  rooms: DungeonRoom[];
  completed: boolean;
  bossDefeated: boolean;
}

// Dungeon room
export interface DungeonRoom {
  id: string;
  type: 'battle' | 'treasure' | 'shop' | 'rest';
  difficulty: number;
  completed: boolean;
  enemies?: Enemy[];
  treasures?: InventoryItem[];
  shopItems?: InventoryItem[];
  position: {
    x: number;
    y: number;
  };
  connections: string[]; // IDs of connected rooms
}
