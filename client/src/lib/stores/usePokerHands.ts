import { create } from 'zustand';
import { Card, PokerHand, PokerHandType, Suit, CardValue } from '@shared/types';

interface PokerHandsState {
  evaluateCards: (cards: Card[]) => PokerHand | null;
  calculateDamage: (hand: PokerHand, damageModifier?: number) => number;
  getHandName: (handType: PokerHandType) => string;
  findBestHand: (board: (Card | null)[][]) => PokerHand | null;
}

export const usePokerHands = create<PokerHandsState>((set, get) => ({
  evaluateCards: (cards: Card[]): PokerHand | null => {
    if (cards.length !== 5) return null;
    
    // Sort cards by value for easier evaluation
    const sortedCards = [...cards].sort((a, b) => a.value - b.value);
    
    // Check for royal flush
    if (isRoyalFlush(sortedCards)) {
      return {
        type: PokerHandType.RoyalFlush,
        cards: sortedCards,
        damage: 200
      };
    }
    
    // Check for straight flush
    if (isStraightFlush(sortedCards)) {
      return {
        type: PokerHandType.StraightFlush,
        cards: sortedCards,
        damage: 150
      };
    }
    
    // Check for four of a kind
    if (isFourOfAKind(sortedCards)) {
      return {
        type: PokerHandType.FourOfAKind,
        cards: sortedCards,
        damage: 120
      };
    }
    
    // Check for full house
    if (isFullHouse(sortedCards)) {
      return {
        type: PokerHandType.FullHouse,
        cards: sortedCards,
        damage: 100
      };
    }
    
    // Check for flush
    if (isFlush(sortedCards)) {
      return {
        type: PokerHandType.Flush,
        cards: sortedCards,
        damage: 80
      };
    }
    
    // Check for straight
    if (isStraight(sortedCards)) {
      return {
        type: PokerHandType.Straight,
        cards: sortedCards,
        damage: 60
      };
    }
    
    // Check for three of a kind
    if (isThreeOfAKind(sortedCards)) {
      return {
        type: PokerHandType.ThreeOfAKind,
        cards: sortedCards,
        damage: 40
      };
    }
    
    // Check for two pair
    if (isTwoPair(sortedCards)) {
      return {
        type: PokerHandType.TwoPair,
        cards: sortedCards,
        damage: 25
      };
    }
    
    // Check for pair
    if (isPair(sortedCards)) {
      return {
        type: PokerHandType.Pair,
        cards: sortedCards,
        damage: 10
      };
    }
    
    // High card (not used in the game, but included for completeness)
    return {
      type: PokerHandType.HighCard,
      cards: sortedCards,
      damage: 0
    };
  },
  
  calculateDamage: (hand: PokerHand, damageModifier: number = 1): number => {
    return Math.floor(hand.damage * damageModifier);
  },
  
  getHandName: (handType: PokerHandType): string => {
    switch (handType) {
      case PokerHandType.RoyalFlush: return 'Royal Flush';
      case PokerHandType.StraightFlush: return 'Straight Flush';
      case PokerHandType.FourOfAKind: return 'Four of a Kind';
      case PokerHandType.FullHouse: return 'Full House';
      case PokerHandType.Flush: return 'Flush';
      case PokerHandType.Straight: return 'Straight';
      case PokerHandType.ThreeOfAKind: return 'Three of a Kind';
      case PokerHandType.TwoPair: return 'Two Pair';
      case PokerHandType.Pair: return 'Pair';
      case PokerHandType.HighCard: return 'High Card';
      default: return 'Unknown Hand';
    }
  },
  
  findBestHand: (board: (Card | null)[][]): PokerHand | null => {
    // Flatten the board to get all cards, filtering out nulls
    const allCards = board.flatMap(row => 
      row.filter((cell): cell is Card => cell !== null)
    );
    
    // All possible 5-card combinations to check
    const possibleHands: Card[][] = [];
    
    // Check rows
    for (let row = 0; row < 5; row++) {
      if (board[row].every(cell => cell !== null)) {
        // Type assertion to tell TypeScript these are all Cards (not nulls)
        const rowCards = board[row].filter((cell): cell is Card => cell !== null);
        possibleHands.push(rowCards);
      }
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
      const column = board.map(row => row[col]);
      if (column.every(cell => cell !== null)) {
        // Type assertion to tell TypeScript these are all Cards (not nulls)
        const colCards = column.filter((cell): cell is Card => cell !== null);
        possibleHands.push(colCards);
      }
    }
    
    // Check diagonals
    const diagonal1 = [board[0][0], board[1][1], board[2][2], board[3][3], board[4][4]];
    const diagonal2 = [board[0][4], board[1][3], board[2][2], board[3][1], board[4][0]];
    
    if (diagonal1.every(cell => cell !== null)) {
      // Type assertion to tell TypeScript these are all Cards (not nulls)
      const diag1Cards = diagonal1.filter((cell): cell is Card => cell !== null);
      possibleHands.push(diag1Cards);
    }
    
    if (diagonal2.every(cell => cell !== null)) {
      // Type assertion to tell TypeScript these are all Cards (not nulls)
      const diag2Cards = diagonal2.filter((cell): cell is Card => cell !== null);
      possibleHands.push(diag2Cards);
    }
    
    // Evaluate each possible hand and find the best one
    let bestHand: PokerHand | null = null;
    
    for (const hand of possibleHands) {
      const evaluatedHand = get().evaluateCards(hand);
      
      if (evaluatedHand && (!bestHand || evaluatedHand.damage > bestHand.damage)) {
        bestHand = evaluatedHand;
      }
    }
    
    return bestHand;
  }
}));

// Helper functions for hand evaluation

function isRoyalFlush(cards: Card[]): boolean {
  return (
    isFlush(cards) &&
    cards[0].value === CardValue.Ten &&
    cards[1].value === CardValue.Jack &&
    cards[2].value === CardValue.Queen &&
    cards[3].value === CardValue.King &&
    cards[4].value === CardValue.Ace
  );
}

function isStraightFlush(cards: Card[]): boolean {
  return isFlush(cards) && isStraight(cards);
}

function isFourOfAKind(cards: Card[]): boolean {
  // Group cards by value
  const valueGroups = groupBy(cards, card => card.value);
  
  // Check if any value appears four times
  return Object.values(valueGroups).some(group => group.length === 4);
}

function isFullHouse(cards: Card[]): boolean {
  // Group cards by value
  const valueGroups = groupBy(cards, card => card.value);
  const groupSizes = Object.values(valueGroups).map(group => group.length);
  
  // Check for 3 of one value and 2 of another
  return groupSizes.includes(3) && groupSizes.includes(2);
}

function isFlush(cards: Card[]): boolean {
  // Check if all cards have the same suit
  const firstSuit = cards[0].suit;
  return cards.every(card => card.suit === firstSuit);
}

function isStraight(cards: Card[]): boolean {
  // Special case for A-2-3-4-5
  if (
    cards[0].value === CardValue.Ace &&
    cards[1].value === CardValue.Two &&
    cards[2].value === CardValue.Three &&
    cards[3].value === CardValue.Four &&
    cards[4].value === CardValue.Five
  ) {
    return true;
  }
  
  // Check if values form a sequence
  for (let i = 1; i < cards.length; i++) {
    if (cards[i].value !== cards[i - 1].value + 1) {
      return false;
    }
  }
  
  return true;
}

function isThreeOfAKind(cards: Card[]): boolean {
  // Group cards by value
  const valueGroups = groupBy(cards, card => card.value);
  
  // Check if any value appears three times
  return Object.values(valueGroups).some(group => group.length === 3);
}

function isTwoPair(cards: Card[]): boolean {
  // Group cards by value
  const valueGroups = groupBy(cards, card => card.value);
  
  // Count how many pairs (groups of 2) we have
  const pairCount = Object.values(valueGroups).filter(group => group.length === 2).length;
  
  return pairCount === 2;
}

function isPair(cards: Card[]): boolean {
  // Group cards by value
  const valueGroups = groupBy(cards, card => card.value);
  
  // Check if any value appears twice
  return Object.values(valueGroups).some(group => group.length === 2);
}

// Helper function to group cards
function groupBy<T>(array: T[], keyFn: (item: T) => any): Record<string, T[]> {
  return array.reduce((result: Record<string, T[]>, item) => {
    const key = keyFn(item).toString();
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
}
