import { memo } from 'react';
import { Card as CardType, Suit } from '@shared/types';

interface CardProps {
  card: CardType;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick: (card: CardType) => void;
}

const Card = ({ card, selected = false, size = 'md', onClick }: CardProps) => {
  const { suit, value, faceUp } = card;
  
  // Determine card dimensions based on size
  const sizeClasses = {
    sm: 'w-10 h-14',
    md: 'w-14 h-20',
    lg: 'w-16 h-24 md:w-20 md:h-28'
  };
  
  // Get suit symbol and color
  const getSuitSymbol = (suit: Suit) => {
    switch (suit) {
      case Suit.Hearts: return '♥';
      case Suit.Diamonds: return '♦';
      case Suit.Clubs: return '♣';
      case Suit.Spades: return '♠';
      default: return '?';
    }
  };
  
  const getSuitColor = (suit: Suit) => {
    return suit === Suit.Hearts || suit === Suit.Diamonds ? 'text-red-600' : 'text-gray-900';
  };
  
  // Get value display
  const getValueDisplay = (value: number) => {
    switch (value) {
      case 1: return 'A';
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      default: return value.toString();
    }
  };
  
  // If card is face down, show card back
  if (!faceUp) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-md flex items-center justify-center 
                    bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-white
                    cursor-pointer shadow-md transform transition-all duration-200
                    ${selected ? 'ring-4 ring-yellow-400 scale-110' : ''}`}
        onClick={() => onClick(card)}
      >
        <div className="w-3/4 h-3/4 rounded-md border-2 border-white flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
      </div>
    );
  }
  
  // Card is face up, show card front
  return (
    <div 
      className={`${sizeClasses[size]} rounded-md flex flex-col p-1
                  bg-white border border-gray-300
                  cursor-pointer shadow-md transform transition-all duration-200
                  ${selected ? 'ring-4 ring-yellow-400 scale-110' : ''}`}
      onClick={() => onClick(card)}
    >
      <div className={`flex items-start justify-between ${getSuitColor(suit)}`}>
        <div className="text-sm font-bold">{getValueDisplay(value)}</div>
        <div className="text-sm">{getSuitSymbol(suit)}</div>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-2xl ${getSuitColor(suit)}`}>
          {getSuitSymbol(suit)}
        </div>
      </div>
      
      <div className={`flex items-end justify-between rotate-180 ${getSuitColor(suit)}`}>
        <div className="text-sm font-bold">{getValueDisplay(value)}</div>
        <div className="text-sm">{getSuitSymbol(suit)}</div>
      </div>
    </div>
  );
};

export default memo(Card);
