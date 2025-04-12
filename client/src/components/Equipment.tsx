import { Weapon, Shield } from '@shared/types';

interface EquipmentProps {
  weapon: Weapon | null;
  shield: Shield | null;
}

const Equipment = ({ weapon, shield }: EquipmentProps) => {
  return (
    <div className="flex space-x-2">
      {weapon && (
        <div className="relative group">
          <div className="w-8 h-8 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <img 
              src={weapon.iconUrl} 
              alt={weapon.name}
              className="w-6 h-6 object-cover" 
            />
          </div>
          
          {/* Tooltip */}
          <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 w-48 bg-black bg-opacity-90 text-white text-xs rounded p-2 hidden group-hover:block z-50">
            <div className="font-bold">{weapon.name}</div>
            <div className={`text-xs ${getTypeColor(weapon.type)}`}>
              {weapon.type.charAt(0).toUpperCase() + weapon.type.slice(1)}
            </div>
            <div className="mt-1">Damage: x{weapon.damageModifier}</div>
            <div className="mt-1 text-gray-300">{weapon.description}</div>
          </div>
        </div>
      )}
      
      {shield && (
        <div className="relative group">
          <div className="w-8 h-8 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <img 
              src={shield.iconUrl} 
              alt={shield.name}
              className="w-6 h-6 object-cover" 
            />
          </div>
          
          {/* Tooltip */}
          <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 w-48 bg-black bg-opacity-90 text-white text-xs rounded p-2 hidden group-hover:block z-50">
            <div className="font-bold">{shield.name}</div>
            <div className={`text-xs ${getShieldTypeColor(shield.type)}`}>
              {shield.type.charAt(0).toUpperCase() + shield.type.slice(1)}
            </div>
            <div className="mt-1">Damage Reduction: {Math.round(shield.damageReduction * 100)}%</div>
            <div className="mt-1 text-gray-300">{shield.description}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get color for weapon type
const getTypeColor = (type: string): string => {
  switch (type) {
    case 'common': return 'text-gray-400';
    case 'uncommon': return 'text-green-400';
    case 'rare': return 'text-blue-400';
    case 'legendary': return 'text-purple-400';
    default: return 'text-gray-400';
  }
};

// Helper function to get color for shield type
const getShieldTypeColor = (type: string): string => {
  switch (type) {
    case 'light': return 'text-yellow-400';
    case 'medium': return 'text-blue-400';
    case 'heavy': return 'text-purple-400';
    default: return 'text-gray-400';
  }
};

export default Equipment;
