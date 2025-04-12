import { memo } from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  type: 'player' | 'enemy';
}

const HealthBar = ({ current, max, type }: HealthBarProps) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  // Determine color based on health percentage
  const getHealthColor = () => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-end mr-2">
        <div className="text-white font-bold">
          {current}/{max} HP
        </div>
        <div className={`text-xs ${type === 'player' ? 'text-blue-300' : 'text-red-300'}`}>
          {type === 'player' ? 'Player' : 'Enemy'}
        </div>
      </div>
      
      <div className="w-32 h-6 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getHealthColor()} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default memo(HealthBar);
