import React, { useState, useEffect } from "react";
import axios from "axios";
import { SketchPicker } from 'react-color';
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import GameHistory from './GameHistory';
import Instructions from './Instructions';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const generateInitialGrid = (size, colors) => {
  let grid = [];
  const [topLeft, topRight, bottomLeft, bottomRight] = colors;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const ratioX = j / (size - 1);
      const ratioY = i / (size - 1);
      
      const color = [
        Math.floor(
          topLeft[0] * (1 - ratioX) * (1 - ratioY) +
          topRight[0] * ratioX * (1 - ratioY) +
          bottomLeft[0] * (1 - ratioX) * ratioY +
          bottomRight[0] * ratioX * ratioY
        ),
        Math.floor(
          topLeft[1] * (1 - ratioX) * (1 - ratioY) +
          topRight[1] * ratioX * (1 - ratioY) +
          bottomLeft[1] * (1 - ratioX) * ratioY +
          bottomRight[1] * ratioX * ratioY
        ),
        Math.floor(
          topLeft[2] * (1 - ratioX) * (1 - ratioY) +
          topRight[2] * ratioX * (1 - ratioY) +
          bottomLeft[2] * (1 - ratioX) * ratioY +
          bottomRight[2] * ratioX * ratioY
        ),
      ];
      
      grid.push({
        id: `${i}-${j}`,
        x: j,
        y: i,
        color: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        locked: i === 0 || j === 0 || i === size - 1 || j === size - 1,
      });
    }
  }
  return grid;
};

const shuffleGrid = (grid) => {
  let shuffled = grid.filter((tile) => !tile.locked);
  shuffled = shuffled.sort(() => Math.random() - 0.5);
  let index = 0;
  return grid.map((tile) => (tile.locked ? tile : { ...tile, color: shuffled[index++].color }));
};

const Tile = ({ tile, onClick, selectedTile }) => (
  <motion.div
    className={`tile ${tile.locked ? 'locked' : ''} ${selectedTile?.id === tile.id ? 'selected' : ''}`}
    style={{ backgroundColor: tile.color }}
    onClick={() => !tile.locked && onClick(tile)}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: tile.locked ? 1 : 1.05 }}
    whileTap={{ scale: tile.locked ? 1 : 0.95 }}
  />
);

const ColorSelector = ({ color, onChange, index, cornerLabel }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const handleColorChange = (newColor) => {
    const rgbArray = [newColor.rgb.r, newColor.rgb.g, newColor.rgb.b];
    onChange(rgbArray, index);
  };
  
  return (
    <div className="color-selector">
      <motion.div 
        className="color-preview" 
        style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
        onClick={() => setShowPicker(!showPicker)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      />
      <div className="corner-label">{cornerLabel}</div>
      {showPicker && (
        <div className="color-picker-popover">
          <div className="color-picker-cover" onClick={() => setShowPicker(false)} />
          <SketchPicker color={{ r: color[0], g: color[1], b: color[2] }} onChange={handleColorChange} />
        </div>
      )}
    </div>
  );
};

const GameSetup = ({ onStartGame }) => {
  const [gridSize, setGridSize] = useState(5);
  const [colors, setColors] = useState([
    [120, 80, 255],  // Top Left (Purple)
    [255, 100, 100], // Top Right (Red)
    [80, 220, 200],  // Bottom Left (Teal)
    [255, 220, 100]  // Bottom Right (Yellow)
  ]);
  
  const handleColorChange = (newColor, index) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
  };
  
  const handleSizeChange = (e) => {
    setGridSize(parseInt(e.target.value, 10));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onStartGame(gridSize, colors);
  };
  
  return (
    <motion.div 
      className="game-setup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>ColorPuzzle Setup</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Grid Size: {gridSize}x{gridSize}</label>
          <select value={gridSize} onChange={handleSizeChange}>
            <option value="5">5x5</option>
            <option value="6">6x6</option>
            <option value="8">8x8</option>
            <option value="10">10x10</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Corner Colors:</label>
          <div className="colors-container">
            <div className="colors-row">
              <ColorSelector color={colors[0]} onChange={handleColorChange} index={0} cornerLabel="Top Left" />
              <ColorSelector color={colors[1]} onChange={handleColorChange} index={1} cornerLabel="Top Right" />
            </div>
            <div className="colors-row">
              <ColorSelector color={colors[2]} onChange={handleColorChange} index={2} cornerLabel="Bottom Left" />
              <ColorSelector color={colors[3]} onChange={handleColorChange} index={3} cornerLabel="Bottom Right" />
            </div>
          </div>
        </div>
        
        <motion.button 
          type="submit" 
          className="start-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Game
        </motion.button>
      </form>
    </motion.div>
  );
};

const SuccessModal = ({ moves, onNewGame }) => {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <motion.div 
      className="success-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="success-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <h2>Puzzle Solved!</h2>
        <p>Congratulations! You completed the puzzle in <span className="moves-count">{moves}</span> moves.</p>
        <motion.button 
          onClick={onNewGame}
          className="new-game-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          New Game
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const ColorPuzzle = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState([]);
  const [solution, setSolution] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameId, setGameId] = useState(null);
  const [size, setSize] = useState(5);
  const [gameColors, setGameColors] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const startGame = async (gridSize, colors) => {
    setSize(gridSize);
    setGameColors(colors);
    
    try {
      const initialGrid = generateInitialGrid(gridSize, colors);
      setSolution([...initialGrid]);
      
      const shuffledGrid = shuffleGrid(initialGrid);
      setGrid(shuffledGrid);
      
      const response = await axios.post(`${API_URL}/api/games`, {
        size: gridSize,
        colors: colors,
        initialGrid: shuffledGrid,
        solution: initialGrid
      });
      
      setGameId(response.data.gameId);
      setGameStarted(true);
      setMoves(0);
      setShowSuccessModal(false);
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Failed to start game. Please try again.");
    }
  };
  
  const handleTileClick = async (clickedTile) => {
    if (clickedTile.locked) return;
    if (!selectedTile) {
      setSelectedTile(clickedTile);
      return;
    }
    
    const updatedGrid = grid.map((tile) => {
      if (tile.id === selectedTile.id) return { ...tile, color: clickedTile.color };
      if (tile.id === clickedTile.id) return { ...tile, color: selectedTile.color };
      return tile;
    });
    
    setGrid(updatedGrid);
    setSelectedTile(null);
    setMoves(moves + 1);
    
    try {
      await axios.put(`${API_URL}/api/games/${gameId}/move`, {
        grid: updatedGrid,
        moves: moves + 1
      });
      
      checkIfSolved(updatedGrid);
    } catch (error) {
      console.error("Failed to update game state:", error);
    }
  };
  
  const checkIfSolved = async (currentGrid) => {
    const isSolved = currentGrid.every((tile, index) => {
      if (tile.locked) return true;
      return tile.color === solution[index].color;
    });
    
    if (isSolved) {
      setShowSuccessModal(true);
      
      try {
        await axios.put(`${API_URL}/api/games/${gameId}/complete`, {
          totalMoves: moves + 1
        });
      } catch (error) {
        console.error("Failed to update game completion:", error);
      }
    }
  };
  
  const resetGame = () => {
    setGameStarted(false);
    setSelectedTile(null);
    setMoves(0);
    setShowSuccessModal(false);
  };
  
  if (!gameStarted) {
    return <GameSetup onStartGame={startGame} />;
  }
  
  return (
    <motion.div 
      className="color-puzzle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1>ColorPuzzle</h1>
      <div className="game-info">
        <span>Moves: {moves}</span>
        <motion.button 
          onClick={resetGame} 
          className="reset-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          New Game
        </motion.button>
      </div>
      <div 
        className="grid" 
        style={{ 
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          width: `${size * 65}px`
        }}
      >
        <AnimatePresence>
          {grid.map((tile) => (
            <Tile 
              key={tile.id} 
              tile={tile} 
              onClick={handleTileClick} 
              selectedTile={selectedTile}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Instructions button */}
      <motion.button 
        className="instructions-button"
        onClick={() => setShowInstructions(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        How to Play
      </motion.button>
      
      <AnimatePresence>
        {showSuccessModal && (
          <SuccessModal moves={moves} onNewGame={resetGame} />
        )}
        
        {/* Instructions */}
        {showInstructions && (
          <Instructions onClose={() => setShowInstructions(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function App() {
  const [showHistory, setShowHistory] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };
  
  return (
    <div className="App">
      <motion.button 
        className="toggle-history-button"
        onClick={toggleHistory}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showHistory ? "Play Game" : "Show History"}
      </motion.button>
      
      <AnimatePresence mode="wait">
        {showHistory ? (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GameHistory />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ColorPuzzle />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showInstructions && (
          <Instructions onClose={() => setShowInstructions(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;