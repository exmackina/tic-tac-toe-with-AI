import { useState } from "react";

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    // créer une copie du tableau squares
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    if (nextHistory.length % 2 === 0) {
      // Si c'est le tour de l'IA

      // Trouver le meilleur coup avec minimax
      let result = minimax(nextSquares, 0, true);

      // Appliquer le meilleur coup
      if (result.move != null) {
        const squaresAfterAI = nextSquares.slice(); // faire une autre copie
        squaresAfterAI[result.move] = "O";
        setHistory([...nextHistory, squaresAfterAI]);
        setCurrentMove(nextHistory.length);
      }
    }
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

///////
// minmax
///////

function minimax(
  squares,
  depth,
  isMaximizingPlayer,
  alpha = -Infinity,
  beta = Infinity
) {
  // Check for terminal states
  let winner = calculateWinner(squares);
  if (winner === "X") {
    return { score: -1 };
  }
  if (winner === "O") {
    return { score: 1 };
  }
  if (isBoardFull(squares)) {
    return { score: 0 };
  }

  // Initialize best score and move
  let bestScore = isMaximizingPlayer ? -Infinity : Infinity;
  let move = null;

  // Loop through the squares to find the best move
  for (let i = 0; i < 9; i++) {
    if (squares[i] == null) {
      // Try the move
      squares[i] = isMaximizingPlayer ? "O" : "X";
      let result = minimax(
        squares,
        depth + 1,
        !isMaximizingPlayer,
        alpha,
        beta
      );
      squares[i] = null;

      // Update best score and move
      if (isMaximizingPlayer && result.score > bestScore) {
        bestScore = result.score;
        move = i;
        alpha = Math.max(alpha, result.score);
      } else if (!isMaximizingPlayer && result.score < bestScore) {
        bestScore = result.score;
        move = i;
        beta = Math.min(beta, result.score);
      }

      // Alpha-beta pruning
      if (beta <= alpha) {
        console.log("Alpha-beta pruning");
        return { score: bestScore, move: move };
      }
    }
  }
  return { score: bestScore, move: move };
}

function isBoardFull(squares) {
  // Retourne false si le plateau a au moins une case vide (null), sinon true
  return !squares.includes(null);
}
