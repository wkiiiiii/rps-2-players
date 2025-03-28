const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || 3000;

// Prepare to use Next.js
const app = next({ dev, hostname: dev ? hostname : undefined, port });
const handle = app.getRequestHandler();

// Game state management
const initialGameState = {
  players: [null, null],
  currentRound: 0,
  roundResult: null,
};

let gameState = { ...initialGameState };

// Function to determine the winner
function determineWinner(choice1, choice2) {
  if (choice1 === choice2) return "It's a tie!";
  if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'paper' && choice2 === 'rock') ||
    (choice1 === 'scissors' && choice2 === 'paper')
  ) {
    return 'Player 1 wins!';
  }
  return 'Player 2 wins!';
}

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(server);

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current game state to new connections
    socket.emit('gameState', gameState);

    // Handle joining as player
    socket.on('joinAsPlayer', (seatIndex) => {
      if (seatIndex >= 0 && seatIndex < 2 && !gameState.players[seatIndex]) {
        gameState.players[seatIndex] = {
          id: socket.id,
          choice: null,
        };
        io.emit('gameState', gameState);
      }
    });

    // Handle player choice
    socket.on('makeChoice', (choice) => {
      const playerIndex = gameState.players.findIndex(p => p?.id === socket.id);
      if (playerIndex !== -1) {
        gameState.players[playerIndex].choice = choice;
        
        // Check if both players have made their choices
        if (gameState.players[0]?.choice && gameState.players[1]?.choice) {
          const result = determineWinner(
            gameState.players[0].choice,
            gameState.players[1].choice
          );
          gameState.roundResult = result;
          gameState.currentRound++;
          io.emit('gameState', gameState);
          
          // Reset choices for next round
          setTimeout(() => {
            gameState.players.forEach(p => {
              if (p) p.choice = null;
            });
            gameState.roundResult = null;
            io.emit('gameState', gameState);
          }, 3000);
        } else {
          io.emit('gameState', gameState);
        }
      }
    });

    // Handle leaving seat
    socket.on('leaveSeat', () => {
      const playerIndex = gameState.players.findIndex(p => p?.id === socket.id);
      if (playerIndex !== -1) {
        gameState.players[playerIndex] = null;
        io.emit('gameState', gameState);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Remove from players if they were playing
      const playerIndex = gameState.players.findIndex(p => p?.id === socket.id);
      if (playerIndex !== -1) {
        gameState.players[playerIndex] = null;
        io.emit('gameState', gameState);
      }
    });
  });

  // Start server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 