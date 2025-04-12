import { Enemy as EnemyType } from '@shared/types';
import { useGameState } from '../lib/stores/useGameState';
import Equipment from './Equipment';

interface EnemyProps {
  enemy: EnemyType;
}

const Enemy = ({ enemy }: EnemyProps) => {
  const { battle } = useGameState();
  
  if (!enemy || !battle) return null;
  
  return (
    <div className="flex items-center space-x-3 bg-black bg-opacity-50 p-2 rounded-lg">
      <div className="relative">
        <img 
          src={enemy.avatarUrl} 
          alt={enemy.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-red-500" 
        />
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {enemy.stats.level}
        </div>
      </div>
      
      <div className="text-white">
        <div className="font-bold">{enemy.name}</div>
        <div className="text-xs">
          {enemy.type.charAt(0).toUpperCase() + enemy.type.slice(1)} Enemy
        </div>
      </div>
      
      <Equipment 
        weapon={battle.enemyStats.equipment.weapon}
        shield={battle.enemyStats.equipment.shield}
      />
    </div>
  );
};

export default Enemy;
