# Tic-Tac-Toe (Frontend)

Real-time multiplayer tic-tac-toe built with **Next.js 15**, **React 19**, and the **SignalR JavaScript client**. Create a room, share the 6-character code with a friend, and play live — every move syncs instantly over WebSockets.

Backend repo: [tic-tac-toe-api](https://github.com/kowsiganarunachalam/tic-tac-toe-api) (ASP.NET Core + SignalR)

<!-- TODO: add a gameplay GIF or screenshot here — this is the single highest-impact thing you can add -->

## Features

- Room-based matchmaking with shareable short codes
- Real-time board sync via SignalR (`@microsoft/signalr`) with automatic reconnection handling
- Dynamic room routes using the Next.js App Router (`/game/[roomId]`)
- Win / draw detection reflected instantly on both clients
- Styled with Tailwind CSS and styled-components

## Tech stack

- Next.js 15 (App Router, Turbopack dev server)
- React 19
- @microsoft/signalr for real-time communication
- Tailwind CSS 4 + styled-components

## Architecture

`src/app/api-caller.js` wraps the SignalR connection in a `GameService` singleton that manages the connection lifecycle (connect, reconnect, close), registers server event handlers (`RoomCreated`, `PlayerJoined`, board updates), and exposes game actions (`CreateRoom`, `JoinRoom`, `MakeMove`) to the React components.

```
src/
├── app/
│   ├── page.js              # Landing: create or join a room
│   ├── game/[roomId]/       # Game screen (dynamic route per room)
│   └── api-caller.js        # SignalR GameService (connection + events)
└── components/
    ├── Game.js              # Game orchestration
    ├── Grid.js / Tile.js    # Board rendering
    ├── PlayerSquare.js      # Player info display
    ├── Popup.js             # Win / draw / rematch dialogs
    └── Loader.js            # Connection states
```

## Running locally

Prerequisites: Node.js 18+, and the [backend API](https://github.com/kowsiganarunachalam/tic-tac-toe-api) running on `http://localhost:5054`.

```bash
git clone https://github.com/kowsiganarunachalam/tic-tac-toe.git
cd tic-tac-toe
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create a room in one tab, and join with the code from a second tab (or another device) to play.
