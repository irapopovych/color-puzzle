// Instructions.js
import React from 'react';
import { motion } from 'framer-motion';

const Instructions = ({ onClose }) => {
  return (
    <motion.div 
      className="instructions-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="instructions-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <h2>How to Play ColorPuzzle</h2>
        
        <div className="instructions-content">
          <p>ColorPuzzle is a color-matching game where you need to restore the gradient pattern by swapping tiles.</p>
          
          <ol>
            <li>The <strong>edge tiles</strong> (around the border) are locked in place and show the correct gradient pattern.</li>
            <li>The <strong>inner tiles</strong> are shuffled and need to be arranged correctly.</li>
            <li>To swap two tiles, first <strong>click on one tile</strong> to select it (it will be highlighted).</li>
            <li>Then <strong>click on another tile</strong> to swap their colors.</li>
            <li>Continue swapping tiles until all colors match the correct gradient pattern.</li>
            <li>The puzzle is solved when all tiles show the correct gradient flowing from corner to corner.</li>
          </ol>
          
          <div className="tip">
            <p>Tip: Pay attention to the locked edge tiles - they provide clues about where each color should go in the gradient!</p>
          </div>
        </div>
        
        <motion.button 
          onClick={onClose}
          className="instructions-close-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Got it!
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Instructions;