import { PokerHand, PokerHandType } from '@shared/types';
import { usePokerHands } from '../lib/stores/usePokerHands';

interface HandEvaluationProps {
  hand: PokerHand | null;
  isPlayer: boolean;
}

const HandEvaluation = ({ hand, isPlayer }: HandEvaluationProps) => {
  const { getHandName } = usePokerHands();
  
  if (!hand) return null;
  
  // Get appropriate styling based on hand type
  const getHandColor = (type: PokerHandType) => {
    switch (type) {
      case PokerHandType.RoyalFlush:
      case PokerHandType.StraightFlush:
        return 'bg-purple-600';
      case PokerHandType.FourOfAKind:
      case PokerHandType.FullHouse:
        return 'bg-red-600';
      case PokerHandType.Flush:
      case PokerHandType.Straight:
        return 'bg-orange-500';
      case PokerHandType.ThreeOfAKind:
        return 'bg-yellow-500';
      case PokerHandType.TwoPair:
      case PokerHandType.Pair:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className={`${isPlayer ? 'bg-blue-100' : 'bg-red-100'} p-2 rounded-lg shadow-md`}>
      <div className="text-xs text-gray-600 mb-1">
        {isPlayer ? 'Your Hand' : 'Enemy Hand'}
      </div>
      <div className={`${getHandColor(hand.type)} text-white px-2 py-1 rounded font-bold text-sm flex justify-between items-center`}>
        <span>{getHandName(hand.type)}</span>
        <span className="ml-2">{hand.damage} dmg</span>
      </div>
    </div>
  );
};

export default HandEvaluation;
