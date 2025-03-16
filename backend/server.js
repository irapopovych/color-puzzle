const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/colorpuzzle';

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const gameSchema = new mongoose.Schema({
  size: Number,
  colors: [[Number]],
  initialGrid: [Object],
  solution: [Object],
  currentGrid: [Object],
  moves: { type: Number, default: 0 },
  isComplete: { type: Boolean, default: false },
  totalMoves: Number,
  startedAt: { type: Date, default: Date.now },
  completedAt: Date
});

const Game = mongoose.model('Game', gameSchema);

app.get('/api/games', async (req, res) => {
  try {
    const games = await Game.find().sort({ startedAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const { size, colors, initialGrid, solution } = req.body;
    
    const game = new Game({
      size,
      colors,
      initialGrid,
      solution,
      currentGrid: initialGrid,
      moves: 0,
      isComplete: false
    });
    
    await game.save();
    res.status(201).json({ message: 'Game created successfully', gameId: game._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/games/:id/move', async (req, res) => {
  try {
    const { grid, moves } = req.body;
    
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    game.currentGrid = grid;
    game.moves = moves;
    await game.save();
    
    res.json({ message: 'Game updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/games/:id/complete', async (req, res) => {
  try {
    const { totalMoves } = req.body;
    
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    game.isComplete = true;
    game.totalMoves = totalMoves;
    game.completedAt = new Date();
    await game.save();
    
    res.json({ message: 'Game completed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/games/:id', async (req, res) => {
  try {
    const result = await Game.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/games', async (req, res) => {
  try {
    await Game.deleteMany({});
    res.json({ message: 'All games deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});