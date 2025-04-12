import { useEffect, useState } from 'react';
import { useGameState } from '../lib/stores/useGameState';
import { DungeonRoom } from '@shared/types';

const DungeonMap = () => {
  const { currentFloor, player, startBattle, setGamePhase } = useGameState();
  const [selectedRoom, setSelectedRoom] = useState<DungeonRoom | null>(null);
  
  useEffect(() => {
    if (!currentFloor) {
      setGamePhase('menu');
    }
  }, [currentFloor, setGamePhase]);
  
  if (!currentFloor || !player) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-2xl">Loading dungeon map...</div>
      </div>
    );
  }
  
  // Handle room selection
  const handleRoomClick = (room: DungeonRoom) => {
    // Can't select completed rooms
    if (room.completed) return;
    
    // Check if room is connected to a completed room
    const isConnectedToCompleted = room.connections.some(connId => {
      const connectedRoom = currentFloor.rooms.find(r => r.id === connId);
      return connectedRoom?.completed;
    });
    
    // Only allow selection if connected to a completed room or it's the start room
    if (isConnectedToCompleted || room.id === 'start') {
      setSelectedRoom(room);
    }
  };
  
  // Handle entering a room
  const handleEnterRoom = () => {
    if (!selectedRoom) return;
    
    if (selectedRoom.type === 'battle' && selectedRoom.enemies && selectedRoom.enemies.length > 0) {
      // Start battle with the first enemy in the room
      startBattle(selectedRoom.enemies[0]);
    } else if (selectedRoom.type === 'treasure') {
      // For treasure rooms, just mark as completed for now
      // In a full implementation, you would add items to inventory here
      const updatedRooms = currentFloor.rooms.map(room => 
        room.id === selectedRoom.id ? { ...room, completed: true } : room
      );
      
      useGameState.setState({
        currentFloor: {
          ...currentFloor,
          rooms: updatedRooms
        }
      });
      
      setSelectedRoom(null);
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white"
      style={{background: 'url(https://images.unsplash.com/photo-1540898824226-21f19654dcf1) center/cover no-repeat'}}>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Header */}
      <div className="relative z-10 p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">{currentFloor.name}</h1>
        <p className="text-sm text-gray-300">Floor {currentFloor.id}</p>
      </div>
      
      {/* Map area */}
      <div className="relative z-10 flex-1 p-4 overflow-auto">
        <div className="relative w-full h-full">
          {/* Draw connections between rooms */}
          <svg className="absolute inset-0 w-full h-full">
            {currentFloor.rooms.map(room => 
              room.connections.map(connId => {
                const connectedRoom = currentFloor.rooms.find(r => r.id === connId);
                if (!connectedRoom) return null;
                
                const startX = room.position.x * 80 + 40;
                const startY = room.position.y * 80 + 40;
                const endX = connectedRoom.position.x * 80 + 40;
                const endY = connectedRoom.position.y * 80 + 40;
                
                return (
                  <line 
                    key={`${room.id}-${connId}`}
                    x1={startX} 
                    y1={startY} 
                    x2={endX} 
                    y2={endY}
                    stroke={room.completed || connectedRoom.completed ? '#34C759' : '#8E8E93'}
                    strokeWidth="4"
                    strokeDasharray={!room.completed && !connectedRoom.completed ? '5,5' : ''}
                  />
                );
              })
            )}
          </svg>
          
          {/* Draw rooms */}
          {currentFloor.rooms.map(room => {
            // Determine room color based on type and state
            let roomColor = '#8E8E93'; // default gray
            if (room.completed) {
              roomColor = '#34C759'; // green for completed
            } else if (room.id === selectedRoom?.id) {
              roomColor = '#007AFF'; // blue for selected
            } else if (
              room.connections.some(connId => {
                const connectedRoom = currentFloor.rooms.find(r => r.id === connId);
                return connectedRoom?.completed;
              }) || room.id === 'start'
            ) {
              // Available rooms are brighter
              roomColor = room.type === 'battle' ? '#FF3B30' : 
                        room.type === 'treasure' ? '#FFCC00' :
                        room.type === 'shop' ? '#5856D6' : '#8E8E93';
            } else {
              // Unavailable rooms are darker
              roomColor = '#555555';
            }
            
            // Determine icon based on room type
            let icon;
            switch (room.type) {
              case 'battle':
                icon = (
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 7H7v6h6V7z" />
                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                  </svg>
                );
                break;
              case 'treasure':
                icon = (
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                    <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                  </svg>
                );
                break;
              case 'shop':
                icon = (
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                );
                break;
              case 'rest':
                icon = (
                  <svg className="w-6 h-6" fill="white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                );
                break;
              default:
                icon = null;
            }
            
            return (
              <div 
                key={room.id}
                className={`absolute w-16 h-16 rounded-lg flex items-center justify-center 
                           transition-all duration-200 
                           ${
                             (room.connections.some(connId => {
                               const connectedRoom = currentFloor.rooms.find(r => r.id === connId);
                               return connectedRoom?.completed;
                             }) || room.id === 'start') && !room.completed
                               ? 'cursor-pointer transform hover:scale-110'
                               : ''
                           }
                           ${room.id === selectedRoom?.id ? 'ring-4 ring-white' : ''}
                          `}
                style={{
                  left: `${room.position.x * 80}px`,
                  top: `${room.position.y * 80}px`,
                  backgroundColor: roomColor
                }}
                onClick={() => handleRoomClick(room)}
              >
                {icon}
                
                {room.completed && (
                  <svg className="absolute w-6 h-6 -top-2 -right-2 text-white bg-green-500 rounded-full" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Selected room info */}
      {selectedRoom && (
        <div className="relative z-10 p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-xl font-bold">
                {selectedRoom.type.charAt(0).toUpperCase() + selectedRoom.type.slice(1)} Room
              </h2>
              <p className="text-sm text-gray-300">
                Difficulty: {'★'.repeat(selectedRoom.difficulty)}
              </p>
            </div>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => setSelectedRoom(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Room details based on type */}
          {selectedRoom.type === 'battle' && selectedRoom.enemies && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Enemies:</h3>
              {selectedRoom.enemies.map(enemy => (
                <div key={enemy.id} className="flex items-center mb-2">
                  <img 
                    src={enemy.avatarUrl}
                    alt={enemy.name} 
                    className="w-10 h-10 rounded-full mr-3 object-cover" 
                  />
                  <div>
                    <div className="font-medium">{enemy.name}</div>
                    <div className="text-xs text-gray-400">Level {enemy.stats.level} {enemy.type}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedRoom.type === 'treasure' && (
            <div className="mb-4">
              <p>A treasure chest awaits you!</p>
            </div>
          )}
          
          <button 
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold"
            onClick={handleEnterRoom}
          >
            Enter Room
          </button>
        </div>
      )}
      
      {/* Bottom navigation */}
      <div className="relative z-10 p-4 bg-gray-900 border-t border-gray-800">
        {/* First row: Stats */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-800 px-3 py-2 rounded-lg flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">{player.gold}</span> Gold
            </div>
            
            <div className="bg-gray-800 px-3 py-2 rounded-lg flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">Level {player.stats.level}</span>
            </div>

            <div className="bg-gray-800 px-3 py-2 rounded-lg flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">Floor {currentFloor.id}</span>
            </div>
          </div>

          <div className="bg-gray-800 px-3 py-2 rounded-lg flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">{player.stats.currentHealth}/{player.stats.maxHealth} HP</span>
          </div>
        </div>
        
        {/* Second row: Navigation buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button 
            className="flex flex-col items-center justify-center bg-red-600 text-white px-2 py-3 rounded-lg"
            onClick={() => setGamePhase('menu')}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Main Menu
          </button>
          
          <button 
            className="flex flex-col items-center justify-center bg-blue-600 text-white px-2 py-3 rounded-lg"
            onClick={() => setGamePhase('profile')}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>
          
          <button 
            className="flex flex-col items-center justify-center bg-purple-600 text-white px-2 py-3 rounded-lg"
            onClick={() => setGamePhase('marketplace')}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Shop
          </button>
          
          <button 
            className="flex flex-col items-center justify-center bg-green-600 text-white px-2 py-3 rounded-lg"
            onClick={() => {
              // Attempt to advance to next level
              useGameState.getState().proceedToNextLevel();
            }}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Next Level
          </button>
        </div>
      </div>
    </div>
  );
};

export default DungeonMap;
