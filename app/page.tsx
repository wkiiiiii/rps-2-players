'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../lib/gameState';

let socket: Socket;

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const initSocket = async () => {
      try {
        // Connect directly to the socket server
        socket = io();

        socket.on('connect', () => {
          console.log('Connected to socket server');
          if (socket.id) {
            setPlayerId(socket.id);
          }
          setLoading(false);
        });

        socket.on('connect_error', (err) => {
          console.error('Connection error:', err);
          setError('Failed to connect to game server. Please try again.');
          setLoading(false);
        });

        socket.on('gameState', (state: GameState) => {
          console.log('Game state updated:', state);
          setGameState(state);
        });
      } catch (error) {
        console.error('Failed to connect:', error);
        setError('Failed to initialize game. Please refresh the page.');
        setLoading(false);
      }
    };

    initSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const joinSeat = (seatIndex: number) => {
    socket.emit('joinAsPlayer', seatIndex);
  };

  const leaveSeat = () => {
    socket.emit('leaveSeat');
  };

  const makeChoice = (choice: 'rock' | 'paper' | 'scissors') => {
    socket.emit('makeChoice', choice);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl">Loading game...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl text-red-500">{error}</div>
    </div>
  );

  if (!gameState) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-xl">Failed to load game state. Please refresh.</div>
    </div>
  );

  const playerIndex = gameState.players.findIndex(p => p?.id === playerId);
  const isPlayer = playerIndex !== -1;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Rock Paper Scissors</h1>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          {gameState.players.map((player, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                Player {index + 1} Seat
                {player?.choice && player.id !== playerId && (
                  <span className="ml-2 text-sm font-normal text-green-600">
                    (Choice made)
                  </span>
                )}
              </h2>
              {!player ? (
                <button
                  onClick={() => joinSeat(index)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={isPlayer}
                >
                  Take Seat
                </button>
              ) : (
                <div>
                  {player.id === playerId ? (
                    <div className="space-y-4">
                      <div className="bg-green-100 p-2 rounded">
                        <p className="font-medium">You are Player {index + 1}</p>
                      </div>
                      
                      {!player.choice ? (
                        <div className="space-y-2">
                          <p>Make your choice:</p>
                          <div className="flex gap-2">
                            {['rock', 'paper', 'scissors'].map((choice) => (
                              <button
                                key={choice}
                                onClick={() => makeChoice(choice as any)}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                              >
                                {choice}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2">Your choice: <span className="font-bold">{player.choice}</span></p>
                          <p className="text-sm text-gray-600">Waiting for other player...</p>
                        </div>
                      )}
                      
                      <button
                        onClick={leaveSeat}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-4"
                      >
                        Leave Seat
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700">Seat taken by another player</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {gameState.roundResult && (
          <div className="text-center p-4 bg-yellow-100 rounded-lg border border-yellow-300 mb-6">
            <div className="text-xl font-bold">{gameState.roundResult}</div>
            <div className="text-sm text-gray-600 mt-1">Starting new round soon...</div>
          </div>
        )}

        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Game Info:</h3>
          <p>Round: {gameState.currentRound}</p>
        </div>
      </div>
    </div>
  );
} 