import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const GameHistory = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGameId, setExpandedGameId] = useState(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/games`);
      setGames(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch games:", err);
      setError("Failed to load game history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleDelete = async (gameId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/api/games/${gameId}`);
      fetchGames();
    } catch (err) {
      console.error("Failed to delete game:", err);
      setError("Failed to delete game");
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${API_URL}/api/games`);
      fetchGames();
    } catch (err) {
      console.error("Failed to clear all games:", err);
      setError("Failed to clear all games");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const calculateDuration = (startDate, endDate) => {
    if (!endDate) return "In progress";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMs = end - start;
    
    const minutes = Math.floor(diffInMs / 60000);
    const seconds = Math.floor((diffInMs % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const toggleGameDetails = (gameId) => {
    if (expandedGameId === gameId) {
      setExpandedGameId(null);
    } else {
      setExpandedGameId(gameId);
    }
  };

  return (
    <motion.div 
      className="game-history"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Game History</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="history-controls">
        <motion.button 
          className="refresh-button"
          onClick={fetchGames}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          Refresh
        </motion.button>
        
        <motion.button 
          className="clear-all-button"
          onClick={handleClearAll}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading || games.length === 0}
        >
          Clear All
        </motion.button>
      </div>
      
      {loading ? (
        <div className="loading">Loading game history...</div>
      ) : games.length === 0 ? (
        <div className="no-games">No games played yet</div>
      ) : (
        <div className="games-list">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Grid Size</th>
                <th>Status</th>
                <th>Moves</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <React.Fragment key={game._id}>
                  <tr 
                    className={expandedGameId === game._id ? "expanded" : ""}
                    onClick={() => toggleGameDetails(game._id)}
                  >
                    <td>{formatDate(game.startedAt)}</td>
                    <td>{game.size}x{game.size}</td>
                    <td>
                      <span className={`status-badge ${game.isComplete ? "complete" : "in-progress"}`}>
                        {game.isComplete ? "Completed" : "In Progress"}
                      </span>
                    </td>
                    <td>{game.isComplete ? game.totalMoves : game.moves}</td>
                    <td>{calculateDuration(game.startedAt, game.completedAt)}</td>
                    <td>
                      <motion.button
                        className="delete-button"
                        onClick={(e) => handleDelete(game._id, e)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete
                      </motion.button>
                    </td>
                  </tr>
                  {expandedGameId === game._id && (
                    <tr className="details-row">
                      <td colSpan="6">
                        <div className="game-details">
                          <div className="detail-item">
                            <strong>Game ID:</strong> {game._id}
                          </div>
                          <div className="detail-item">
                            <strong>Started:</strong> {formatDate(game.startedAt)}
                          </div>
                          {game.completedAt && (
                            <div className="detail-item">
                              <strong>Completed:</strong> {formatDate(game.completedAt)}
                            </div>
                          )}
                          <div className="detail-item colors-preview">
                            <strong>Corner Colors:</strong>
                            <div className="color-squares">
                              {game.colors && game.colors.map((color, index) => (
                                <div 
                                  key={index}
                                  className="color-square"
                                  style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
                                  title={`RGB(${color[0]}, ${color[1]}, ${color[2]})`}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default GameHistory;