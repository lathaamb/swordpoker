import React from 'react';
import { useGameState } from '../lib/stores/useGameState';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Weapon, Shield, Consumable } from '@shared/types';

const ProfilePage: React.FC = () => {
  const { player, dungeonLevel, setGamePhase } = useGameState();
  const [selectedTab, setSelectedTab] = React.useState('stats');

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>No player data available.</p>
        <Button onClick={() => setGamePhase('menu')}>Back to Menu</Button>
      </div>
    );
  }

  // Calculate XP progress percentage
  const currentLevel = player.stats.level;
  const xpForNextLevel = currentLevel * 100;
  const currentXP = player.stats.experience % xpForNextLevel;
  const xpProgress = (currentXP / xpForNextLevel) * 100;

  // Group inventory items by type
  const weapons = player.inventory.filter((item): item is Weapon => 'damageModifier' in item);
  const shields = player.inventory.filter((item): item is Shield => 'damageReduction' in item);
  const consumables = player.inventory.filter((item): item is Consumable => 'quantity' in item);

  // Helper to get equipped status
  const isEquipped = (item: Weapon | Shield) => {
    if ('damageModifier' in item) {
      return player.stats.equipment.weapon?.id === item.id;
    } else {
      return player.stats.equipment.shield?.id === item.id;
    }
  };

  // Calculate total games played
  // In a real app, this would come from server-side data
  const gamesPlayed = dungeonLevel + 2; // Placeholder
  const gamesWon = Math.floor(gamesPlayed * 0.7); // Placeholder

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Player Profile</h1>
          <p className="text-gray-500">Level {player.stats.level} Adventurer</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setGamePhase('dungeon_map')}>Return to Game</Button>
          <Button variant="outline" onClick={() => setGamePhase('marketplace')}>Visit Shop</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Player Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">{player.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">{player.name}</h3>
                <p className="text-sm text-gray-500">Dungeon Level: {dungeonLevel}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Health</span>
                  <span className="text-sm">{player.stats.currentHealth}/{player.stats.maxHealth}</span>
                </div>
                <Progress value={(player.stats.currentHealth / player.stats.maxHealth) * 100} className="h-2 bg-gray-200" indicatorClassName="bg-red-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Experience</span>
                  <span className="text-sm">{currentXP}/{xpForNextLevel}</span>
                </div>
                <Progress value={xpProgress} className="h-2 bg-gray-200" indicatorClassName="bg-blue-500" />
              </div>
              <div className="flex justify-between py-2 border-t">
                <span>Gold</span>
                <span className="font-bold text-amber-600">{player.gold}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Weapon</h3>
                {player.stats.equipment.weapon ? (
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold">{player.stats.equipment.weapon.name}</span>
                      <Badge variant={
                        player.stats.equipment.weapon.type === 'common' ? 'default' :
                        player.stats.equipment.weapon.type === 'uncommon' ? 'secondary' :
                        player.stats.equipment.weapon.type === 'rare' ? 'destructive' : 'outline'
                      }>
                        {player.stats.equipment.weapon.type}
                      </Badge>
                    </div>
                    <p className="text-xs mb-2">{player.stats.equipment.weapon.description}</p>
                    <div className="text-sm">Damage: ×{player.stats.equipment.weapon.damageModifier.toFixed(2)}</div>
                  </div>
                ) : (
                  <div className="p-3 border rounded-md bg-gray-50 text-center text-gray-500">
                    No weapon equipped
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Shield</h3>
                {player.stats.equipment.shield ? (
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold">{player.stats.equipment.shield.name}</span>
                      <Badge variant={
                        player.stats.equipment.shield.type === 'light' ? 'default' :
                        player.stats.equipment.shield.type === 'medium' ? 'secondary' : 'destructive'
                      }>
                        {player.stats.equipment.shield.type}
                      </Badge>
                    </div>
                    <p className="text-xs mb-2">{player.stats.equipment.shield.description}</p>
                    <div className="text-sm">Reduction: {(player.stats.equipment.shield.damageReduction * 100).toFixed(0)}%</div>
                  </div>
                ) : (
                  <div className="p-3 border rounded-md bg-gray-50 text-center text-gray-500">
                    No shield equipped
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Game Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-md text-center">
                  <div className="text-2xl font-bold text-blue-600">{gamesPlayed}</div>
                  <div className="text-sm text-gray-500">Games Played</div>
                </div>
                <div className="p-3 border rounded-md text-center">
                  <div className="text-2xl font-bold text-green-600">{gamesWon}</div>
                  <div className="text-sm text-gray-500">Games Won</div>
                </div>
                <div className="p-3 border rounded-md text-center">
                  <div className="text-2xl font-bold text-purple-600">{dungeonLevel}</div>
                  <div className="text-sm text-gray-500">Max Level</div>
                </div>
                <div className="p-3 border rounded-md text-center">
                  <div className="text-2xl font-bold text-amber-600">{player.gold}</div>
                  <div className="text-sm text-gray-500">Gold Earned</div>
                </div>
              </div>
              <div className="text-center pt-2 text-sm text-gray-500">
                Win Rate: {Math.round((gamesWon / gamesPlayed) * 100)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stats" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="stats">Achievements</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Master of Cards</h3>
                <Badge>Unlocked</Badge>
              </div>
              <p className="text-sm text-gray-600">Win a game with a royal flush.</p>
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Dungeon Delver</h3>
                <Badge variant="outline">Level {dungeonLevel}/10</Badge>
              </div>
              <p className="text-sm text-gray-600">Reach level 10 in the dungeon.</p>
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Wealthy Merchant</h3>
                <Badge variant="outline">{player.gold}/1000</Badge>
              </div>
              <p className="text-sm text-gray-600">Accumulate 1000 gold.</p>
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Full House</h3>
                <Badge variant={player.stats.level >= 5 ? 'default' : 'outline'}>
                  {player.stats.level >= 5 ? 'Unlocked' : 'Locked'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">Reach level 5 with your character.</p>
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Dragon Slayer</h3>
                <Badge variant={dungeonLevel >= 8 ? 'default' : 'outline'}>
                  {dungeonLevel >= 8 ? 'Unlocked' : 'Locked'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">Defeat the dungeon boss on level 8.</p>
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Collector</h3>
                <Badge variant={player.inventory.length >= 10 ? 'default' : 'outline'}>
                  {player.inventory.length}/10
                </Badge>
              </div>
              <p className="text-sm text-gray-600">Collect 10 different items.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Weapons ({weapons.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weapons.length > 0 ? (
                weapons.map(weapon => (
                  <div key={weapon.id} className={`p-3 border rounded-md ${isEquipped(weapon) ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="flex justify-between items-start">
                      <span className="font-bold">{weapon.name}</span>
                      <Badge variant={
                        weapon.type === 'common' ? 'default' :
                        weapon.type === 'uncommon' ? 'secondary' :
                        weapon.type === 'rare' ? 'destructive' : 'outline'
                      }>
                        {weapon.type}
                      </Badge>
                    </div>
                    <p className="text-xs my-2">{weapon.description}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm">Damage: ×{weapon.damageModifier.toFixed(2)}</span>
                      {isEquipped(weapon) ? (
                        <Badge variant="outline">Equipped</Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => {
                          // Equip the weapon
                          if (player && player.stats) {
                            const updatedEquipment = {
                              ...player.stats.equipment,
                              weapon
                            };
                            const updatedStats = {
                              ...player.stats,
                              equipment: updatedEquipment
                            };
                            useGameState.setState({
                              player: {
                                ...player,
                                stats: updatedStats
                              }
                            });
                          }
                        }}>
                          Equip
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-4 border rounded-md text-center text-gray-500">
                  No weapons in inventory
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Shields ({shields.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shields.length > 0 ? (
                shields.map(shield => (
                  <div key={shield.id} className={`p-3 border rounded-md ${isEquipped(shield) ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="flex justify-between items-start">
                      <span className="font-bold">{shield.name}</span>
                      <Badge variant={
                        shield.type === 'light' ? 'default' :
                        shield.type === 'medium' ? 'secondary' : 'destructive'
                      }>
                        {shield.type}
                      </Badge>
                    </div>
                    <p className="text-xs my-2">{shield.description}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm">Reduction: {(shield.damageReduction * 100).toFixed(0)}%</span>
                      {isEquipped(shield) ? (
                        <Badge variant="outline">Equipped</Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => {
                          // Equip the shield
                          if (player && player.stats) {
                            const updatedEquipment = {
                              ...player.stats.equipment,
                              shield
                            };
                            const updatedStats = {
                              ...player.stats,
                              equipment: updatedEquipment
                            };
                            useGameState.setState({
                              player: {
                                ...player,
                                stats: updatedStats
                              }
                            });
                          }
                        }}>
                          Equip
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-4 border rounded-md text-center text-gray-500">
                  No shields in inventory
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Consumables ({consumables.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consumables.length > 0 ? (
                consumables.map(item => (
                  <div key={item.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <span className="font-bold">{item.name}</span>
                      <Badge variant={
                        item.type === 'healthPotion' ? 'default' :
                        item.type === 'cardManipulation' ? 'secondary' : 'destructive'
                      }>
                        {item.type === 'healthPotion' ? 'Health' : 
                         item.type === 'cardManipulation' ? 'Cards' : 'Special'}
                      </Badge>
                    </div>
                    <p className="text-xs my-2">{item.description}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm">Quantity: {item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => {
                        // Use item logic would go here
                        console.log(`Using item: ${item.name}`);
                      }} disabled={!item.quantity}>
                        Use
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-4 border rounded-md text-center text-gray-500">
                  No consumables in inventory
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
