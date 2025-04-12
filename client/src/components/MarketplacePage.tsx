import React, { useState, useEffect } from 'react';
import { useGameState } from '../lib/stores/useGameState';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Weapon, Shield, Consumable, Suit, PokerHandType } from '@shared/types';

// Helper function to generate marketplace items
const generateMarketplaceItems = (dungeonLevel: number) => {
  // Generate weapons based on dungeon level
  const weapons: Weapon[] = [
    {
      id: `shop-weapon-1-${dungeonLevel}`,
      name: 'Steel Sword',
      type: 'common',
      damageModifier: 1.2 + (dungeonLevel * 0.05),
      effects: [],
      description: 'A reliable steel sword with decent damage.',
      iconUrl: 'https://images.unsplash.com/photo-1682903028658-fe2f9e972c83'
    },
    {
      id: `shop-weapon-2-${dungeonLevel}`,
      name: 'Firebrand',
      type: 'uncommon',
      damageModifier: 1.4 + (dungeonLevel * 0.08),
      effects: [
        {
          type: 'damageBonus',
          condition: Suit.Hearts, // Using a Suit enum value instead of invalid string
          value: 10,
          description: 'Extra damage when using hearts.'
        }
      ],
      description: 'A sword imbued with fire magic that deals extra damage with flush hands.',
      iconUrl: 'https://images.unsplash.com/photo-1683010378140-dcc23f493f34'
    },
    {
      id: `shop-weapon-3-${dungeonLevel}`,
      name: dungeonLevel > 5 ? 'Dragon Slayer' : 'Obsidian Edge',
      type: dungeonLevel > 5 ? 'legendary' : 'rare',
      damageModifier: dungeonLevel > 5 ? 2.0 + (dungeonLevel * 0.1) : 1.7 + (dungeonLevel * 0.09),
      effects: [
        {
          type: 'damageBonus',
          condition: Suit.Spades, // Using a Suit enum value instead of invalid string
          value: 25,
          description: 'Significant bonus damage when using spades.'
        }
      ],
      description: dungeonLevel > 5 ? 
        'A legendary blade forged to slay dragons, deals massive damage.' : 
        'A blade made from volcanic glass that cuts through defenses.',
      iconUrl: 'https://images.unsplash.com/photo-1690214392595-a9e0b0edd55a'
    }
  ];

  // Generate shields based on dungeon level
  const shields: Shield[] = [
    {
      id: `shop-shield-1-${dungeonLevel}`,
      name: 'Wooden Buckler',
      type: 'light',
      damageReduction: 0.15 + (dungeonLevel * 0.01),
      effects: [],
      description: 'A small wooden shield that offers basic protection.',
      iconUrl: 'https://images.unsplash.com/photo-1701438218924-d2872754172c'
    },
    {
      id: `shop-shield-2-${dungeonLevel}`,
      name: 'Kite Shield',
      type: 'medium',
      damageReduction: 0.25 + (dungeonLevel * 0.015),
      effects: [
        {
          type: 'statusResistance',
          value: 10,
          description: 'Provides some resistance to status effects.'
        }
      ],
      description: 'A medium shield that offers good protection and some status resistance.',
      iconUrl: 'https://images.unsplash.com/photo-1703886317183-9ae3eeb17be4'
    },
    {
      id: `shop-shield-3-${dungeonLevel}`,
      name: dungeonLevel > 5 ? 'Tower Shield' : 'Steel Defender',
      type: 'heavy',
      damageReduction: dungeonLevel > 5 ? 0.40 + (dungeonLevel * 0.02) : 0.30 + (dungeonLevel * 0.018),
      effects: [
        {
          type: 'reflection',
          value: 15,
          description: 'Has a chance to reflect damage back to the attacker.'
        }
      ],
      description: dungeonLevel > 5 ? 
        'A massive shield that provides exceptional protection and can reflect damage.' : 
        'A sturdy shield made of steel that provides solid protection.',
      iconUrl: 'https://images.unsplash.com/photo-1698151393482-98c86289dbc3'
    }
  ];

  // Generate consumables
  const consumables: Consumable[] = [
    {
      id: `shop-potion-1-${dungeonLevel}`,
      name: 'Health Potion',
      type: 'healthPotion',
      effect: (gameState) => {
        const player = gameState.player;
        if (player) {
          const healAmount = 20 + (dungeonLevel * 5);
          player.stats.currentHealth = Math.min(
            player.stats.currentHealth + healAmount,
            player.stats.maxHealth
          );
        }
      },
      description: `Restores ${20 + (dungeonLevel * 5)} health points.`,
      iconUrl: 'https://images.unsplash.com/photo-1659892368966-eb611ab591aa',
      quantity: 1
    },
    {
      id: `shop-potion-2-${dungeonLevel}`,
      name: 'Card Refresh',
      type: 'cardManipulation',
      effect: (gameState) => {
        const battle = gameState.battle;
        if (battle && battle.playerTurn) {
          const newCards = [];
          for (let i = 0; i < battle.playerHand.length; i++) {
            const newCard = gameState.drawCard();
            if (newCard) newCards.push(newCard);
          }
          battle.playerHand = newCards;
        }
      },
      description: 'Replaces all cards in your hand with new ones.',
      iconUrl: 'https://images.unsplash.com/photo-1640777737643-f216beb2f9e9',
      quantity: 1
    },
    {
      id: `shop-potion-3-${dungeonLevel}`,
      name: 'Critical Hit Elixir',
      type: 'special',
      effect: (gameState) => {
        // Logic would be implemented in the game to apply a critical hit on the next attack
        console.log("Critical Hit Elixir used: Next attack will be a critical hit!");
      },
      description: 'Your next attack will automatically be a critical hit, dealing 50% more damage.',
      iconUrl: 'https://images.unsplash.com/photo-1708955697260-1e14822d0aeb',
      quantity: 1
    }
  ];

  return { weapons, shields, consumables };
};

const MarketplacePage: React.FC = () => {
  const { player, dungeonLevel, setGamePhase, gainGold } = useGameState();
  const [selectedTab, setSelectedTab] = useState('weapons');
  const [shopItems, setShopItems] = useState<{
    weapons: Weapon[];
    shields: Shield[];
    consumables: Consumable[];
  }>({ weapons: [], shields: [], consumables: [] });
  
  // Add these functions
  const addToInventory = (item: Weapon | Shield | Consumable) => {
    if (!player) return;
    
    const newInventory = [...player.inventory, item];
    useGameState.setState({ 
      player: {
        ...player,
        inventory: newInventory
      }
    });
  };
  
  const buyItem = (item: Weapon | Shield | Consumable, price: number) => {
    if (!player || player.gold < price) return;
    
    // Deduct gold
    gainGold(-price);
    
    // Add item to inventory
    addToInventory(item);
    
    // Remove from shop (optional)
    if ('damageModifier' in item) {
      setShopItems({
        ...shopItems,
        weapons: shopItems.weapons.filter(w => w.id !== item.id)
      });
    } else if ('damageReduction' in item) {
      setShopItems({
        ...shopItems,
        shields: shopItems.shields.filter(s => s.id !== item.id)
      });
    } else {
      setShopItems({
        ...shopItems, 
        consumables: shopItems.consumables.filter(c => c.id !== item.id)
      });
    }
  };

  // Calculate item prices
  const calculatePrice = (item: Weapon | Shield | Consumable): number => {
    if ('damageModifier' in item) {
      // Weapon pricing
      const basePrice = 50;
      const rarityFactor = 
        item.type === 'common' ? 1 :
        item.type === 'uncommon' ? 2 :
        item.type === 'rare' ? 4 : 8;
      const modifierFactor = item.damageModifier * 10;
      return Math.round(basePrice * rarityFactor * (1 + dungeonLevel / 10) + modifierFactor);
    } else if ('damageReduction' in item) {
      // Shield pricing
      const basePrice = 40;
      const typeFactor = 
        item.type === 'light' ? 1 :
        item.type === 'medium' ? 2 : 4;
      const reductionFactor = item.damageReduction * 100;
      return Math.round(basePrice * typeFactor * (1 + dungeonLevel / 10) + reductionFactor);
    } else {
      // Consumable pricing
      const basePrice = 20;
      const typeFactor = 
        item.type === 'healthPotion' ? 1 :
        item.type === 'cardManipulation' ? 2 : 3;
      return Math.round(basePrice * typeFactor * (1 + dungeonLevel / 15));
    }
  };

  // Generate shop items when component mounts or dungeon level changes
  useEffect(() => {
    const items = generateMarketplaceItems(dungeonLevel);
    setShopItems(items);
  }, [dungeonLevel]);

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>No player data available.</p>
        <Button onClick={() => setGamePhase('menu')}>Back to Menu</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-gray-500">Level {dungeonLevel} items available</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-yellow-100 px-4 py-2 rounded-md">
            <span className="font-bold">Your Gold: {player.gold}</span>
          </div>
          <Button onClick={() => setGamePhase('dungeon_map')}>Return to Game</Button>
          <Button variant="outline" onClick={() => setGamePhase('profile')}>View Profile</Button>
        </div>
      </div>

      <Tabs defaultValue="weapons" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="weapons">Weapons</TabsTrigger>
          <TabsTrigger value="shields">Shields</TabsTrigger>
          <TabsTrigger value="consumables">Consumables</TabsTrigger>
        </TabsList>

        <TabsContent value="weapons" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopItems.weapons.map(weapon => {
              const price = calculatePrice(weapon);
              const canAfford = player.gold >= price;
              
              return (
                <Card key={weapon.id} className={!canAfford ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{weapon.name}</CardTitle>
                      <Badge variant={
                        weapon.type === 'common' ? 'default' :
                        weapon.type === 'uncommon' ? 'secondary' :
                        weapon.type === 'rare' ? 'destructive' : 'outline'
                      }>
                        {weapon.type}
                      </Badge>
                    </div>
                    <CardDescription>Damage Modifier: ×{weapon.damageModifier.toFixed(2)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{weapon.description}</p>
                    
                    {weapon.effects.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-1">Special Effects:</h4>
                        <ul className="text-xs space-y-1">
                          {weapon.effects.map((effect, index) => (
                            <li key={index} className="bg-blue-50 p-2 rounded">
                              {effect.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div className="font-bold text-amber-600">{price} Gold</div>
                    <Button 
                      disabled={!canAfford}
                      onClick={() => buyItem(weapon, price)}
                    >
                      {canAfford ? 'Buy' : 'Not enough gold'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="shields" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopItems.shields.map(shield => {
              const price = calculatePrice(shield);
              const canAfford = player.gold >= price;
              
              return (
                <Card key={shield.id} className={!canAfford ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{shield.name}</CardTitle>
                      <Badge variant={
                        shield.type === 'light' ? 'default' :
                        shield.type === 'medium' ? 'secondary' : 'destructive'
                      }>
                        {shield.type}
                      </Badge>
                    </div>
                    <CardDescription>Damage Reduction: {(shield.damageReduction * 100).toFixed(0)}%</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{shield.description}</p>
                    
                    {shield.effects.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-1">Special Effects:</h4>
                        <ul className="text-xs space-y-1">
                          {shield.effects.map((effect, index) => (
                            <li key={index} className="bg-green-50 p-2 rounded">
                              {effect.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div className="font-bold text-amber-600">{price} Gold</div>
                    <Button 
                      disabled={!canAfford}
                      onClick={() => buyItem(shield, price)}
                    >
                      {canAfford ? 'Buy' : 'Not enough gold'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="consumables" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopItems.consumables.map(item => {
              const price = calculatePrice(item);
              const canAfford = player.gold >= price;
              
              return (
                <Card key={item.id} className={!canAfford ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{item.name}</CardTitle>
                      <Badge variant={
                        item.type === 'healthPotion' ? 'default' :
                        item.type === 'cardManipulation' ? 'secondary' : 'destructive'
                      }>
                        {item.type === 'healthPotion' ? 'Health' : 
                         item.type === 'cardManipulation' ? 'Cards' : 'Special'}
                      </Badge>
                    </div>
                    <CardDescription>Single-use item</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{item.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div className="font-bold text-amber-600">{price} Gold</div>
                    <Button 
                      disabled={!canAfford}
                      onClick={() => buyItem(item, price)}
                    >
                      {canAfford ? 'Buy' : 'Not enough gold'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplacePage;