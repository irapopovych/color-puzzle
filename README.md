# ColorPuzzle Game

ColorPuzzle is a web-based puzzle game inspired by "I Love Hue" where players arrange color tiles to form a perfect gradient. The game allows users to choose their own 4 corner colors and grid size, creating a unique puzzle experience each time.

## Architecture

This application is built using a three-tier architecture running in Docker containers:

1. **Frontend (React)**: User interface built with React
   - Port: 3000
   - Image: Custom-built from `./frontend`
   - Technologies: React, Axios, Framer Motion, React-Color

2. **Backend (Node.js/Express)**: REST API server
   - Port: 5000
   - Image: Custom-built from `./backend`
   - Technologies: Express, Mongoose, Cors, Body-Parser

3. **Database (MongoDB)**: Data storage
   - Port: 27017
   - Image: `mongo:6.0` from Docker Hub
   - Volume: `mongodb_data` for data persistence

## Inter-Service Communication

- **Frontend → Backend**: The React frontend communicates with the backend using Axios HTTP client:
  ```javascript
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const response = await axios.post(`${API_URL}/api/games`, {...});
  ```

- **Backend → MongoDB**: The Express backend connects to MongoDB using Mongoose:
  ```javascript
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/colorpuzzle';
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
  ```

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/irapopovych/color-puzzle.git
   cd color-puzzle
   ```

2. Make the scripts executable:
   ```bash
   chmod +x prepare-app.sh start-app.sh end-app.sh
   ```

3. Prepare the application (builds images and creates network/volumes):
   ```bash
   ./prepare-app.sh
   ```

4. Start the application:
   ```bash
   ./start-app.sh
   ```

5. Access the game:
   - Open your web browser and navigate to [http://localhost:3000](http://localhost:3000)

6. To stop the application:
   ```bash
   ./end-app.sh
   ```

## Game Features

- **Custom Color Selection**: Choose four corner colors to create unique puzzles
- **Multiple Grid Sizes**: Select from 5x5, 6x6, 8x8, or 10x10 grids
- **Reference Points**: Locked corner and edge tiles help guide puzzle solving
- **Move Counter**: Track how many swaps you've made
- **Automatic Win Detection**: Get immediate feedback when you solve the puzzle
- **Animation Effects**: Smooth transitions and confetti celebration
- **Persistent Data**: Game progress saved in MongoDB
- **Game History**: View, manage, and track all your played games

## Game History Feature

The Game History feature allows players to:

- **Track Progress**: View a list of all games played, including completion status
- **Review Stats**: See the number of moves, grid size, and duration for each game
- **Manage Games**: Delete individual games or clear the entire history
- **View Details**: Expand game entries to see detailed information including:
  - Game start and completion timestamps
  - Corner colors used in the puzzle
  - Grid size and completion status

Toggle between the game view and history view using the button in the top-left corner of the screen.

## Data Flow

1. **Game Creation**:
   - User selects grid size and colors
   - Frontend generates initial grid and solution
   - Backend stores game data in MongoDB
   - Scrambled grid is displayed to the user

2. **Game Play**:
   - User swaps tiles to restore the gradient
   - Each move is sent to the backend and saved
   - Current state is maintained across sessions

3. **Game Completion**:
   - Solution validation happens on each move
   - When solved, completion state and stats are saved
   - Confetti animation celebrates success

4. **History Management**:
   - Games are stored in MongoDB with all relevant metadata
   - History view fetches all games from the database
   - Users can refresh the list, delete games, or view detailed information

## Troubleshooting

- **Application won't start**: Check if the ports 3000, 5000, or 27017 are already in use
- **Can't connect to backend**: Ensure the backend container is running with `docker ps`
- **Data not persisting**: Verify the MongoDB volume was created correctly
- **History not loading**: Check network connectivity between frontend and backend
- **Game stats not updating**: Ensure proper API calls are being made after moves

## Technical Details

### Container Configuration

All containers are configured with:
- Automatic restart policy (`--restart always`)
- Proper network connectivity (`colorpuzzle-network`)
- Environment variables for service discovery
- Port mapping for external access

### API Endpoints

- `GET /api/games`: List all games
- `GET /api/games/:id`: Get specific game details
- `POST /api/games`: Create new game
- `PUT /api/games/:id/move`: Update game state after a move
- `PUT /api/games/:id/complete`: Mark game as completed
- `DELETE /api/games/:id`: Delete a specific game
- `DELETE /api/games`: Clear all games history
- `GET /api/health`: Health check endpoint

### Volume Management

The application uses a named volume `mongodb_data` to persist the database between container restarts.
