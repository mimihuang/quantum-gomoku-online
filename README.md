# Quantum Gomoku Online

**Play here:** [https://quantum-gomoku-online.onrender.com](https://quantum-gomoku-online.onrender.com)

Game Designer: Er-Cheng Tang and Miryam Huang

## Shared Key Instruction
  Two players must enter the same shared key to join the same game room.

## Game Rules

- **Two Players**:  
  Player A (Black) and Player B (White) take turns playing.

- **Quantum State Selection**:  
  Each player can only select specific quantum states:
  - **Player A**: `|0⟩` or `|+⟩`
  - **Player B**: `|1⟩` or `|-⟩`

- **Turn Rules**:
  - **First Turn**:  
    - Player A must place a stone.
  - **Subsequent Turns**:  
    - On each turn, a player may choose to:
      - **Place** a stone with their allowed quantum state.
      - **Measure** the entire board using either basis:
        - **Standard Basis**: (`|0⟩`, `|1⟩`)
        - **Hadamard Basis**: (`|+⟩`, `|-⟩`)
    - After completing one action (placing or measuring), the turn immediately passes to the next player.

- **Placing Stones**:  
  Players click on an empty intersection on the 15×15 board to place a stone initialized with their selected quantum state.

- **Measuring Stones**:  
  Measurement collapses all unmeasured stones into a definite classical color:
  - `Black` if the state collapses to `|0⟩` or `|+⟩`
  - `White` if the state collapses to `|1⟩` or `|-⟩`

- **Winning Condition**:  
  After a measurement, if a player has **five stones of the same color** connected consecutively in a straight line (horizontally, vertically, or diagonally), they win the game.

- **Restarting the Game**:  
  Either player can restart the game by clicking the "Restart Game" button.

---

## Tech
- Node.js
- Express
- Socket.io
- HTML5 Canvas
- Render (for hosting)

<img width="910" alt="image" src="https://github.com/user-attachments/assets/ba41393d-41f9-4729-be15-dbb9f17d46d8" />

