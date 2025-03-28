# Rock Paper Scissors - 2 Players Online Game

A simple online rock paper scissors game for two players.

## Features

- Real-time multiplayer game using Socket.IO
- Two player seats that anyone can join
- Simple and intuitive UI
- Automatic round tracking

## Running Locally

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploying to Render

1. Create a new account on [Render](https://render.com) if you don't have one
2. Connect your GitHub repository to Render
3. Create a new Web Service with the following settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Set `NODE_ENV` to `production`

Alternatively, you can use the `render.yaml` file in this repository for automatic deployment configuration.

## How to Play

1. Open the game in your browser
2. Click "Take Seat" to join as Player 1 or Player 2
3. Make your choice: Rock, Paper, or Scissors
4. Wait for the other player to make their choice
5. See the result and play another round!

## Technology Stack

- Next.js
- React
- Socket.IO
- Tailwind CSS 