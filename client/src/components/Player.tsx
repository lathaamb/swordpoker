import { Player as PlayerType } from '@shared/types';
import { useGameState } from '../lib/stores/useGameState';
import Equipment from './Equipment';

interface PlayerProps {
  player: PlayerType;
}

const Player = ({ player }: PlayerProps) => {
  const { battle } = useGameState();
  
  if (!player || !battle) return null;
  
  return (
    <div className="flex items-center space-x-3 bg-black bg-opacity-50 p-2 rounded-lg">
      <div className="relative">
        <img 
          src={player.avatarUrl} 
          alt={player.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-white" 
        />
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {player.stats.level}
        </div>
      </div>
      
      <div className="text-white">
        <div className="font-bold">{player.name}</div>
        <div className="text-xs flex items-center">
          <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {player.gold} Gold
        </div>
      </div>
      
      <Equipment 
        weapon={battle.playerStats.equipment.weapon}
        shield={battle.playerStats.equipment.shield}
      />
    </div>
  );
};

export default Player;
