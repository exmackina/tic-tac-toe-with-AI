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
      // Convertir le plateau en 2D pour Minimax
      let board2D = [];
      for (let i = 0; i < 3; i++) {
        board2D[i] = nextSquares.slice(i * 3, (i + 1) * 3);
      }

      // Trouver le meilleur coup avec minimax
      let result = minimax(board2D, 0, true);

      // Appliquer le meilleur coup (après avoir converti le plateau 2D en 1D)
      if (result.move) {
        nextSquares[result.move.i * 3 + result.move.j] = "O";
        setHistory([...nextHistory, nextSquares]);
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

function minimax(board, depth, isMaximizingPlayer) {
  if (hasPlayerWon(board, "X")) {
    return { score: -1 };
  }
  if (hasPlayerWon(board, "O")) {
    return { score: 1 };
  }
  if (isBoardFull(board)) {
    return { score: 0 };
  }

  let bestScore = isMaximizingPlayer ? -Infinity : Infinity;
  let move = null;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] == null) {
        board[i][j] = isMaximizingPlayer ? "O" : "X";
        let result = minimax(board, depth + 1, !isMaximizingPlayer);
        board[i][j] = null;
        if (isMaximizingPlayer) {
          if (result.score > bestScore) {
            bestScore = result.score;
            move = { i, j };
          }
        } else {
          if (result.score < bestScore) {
            bestScore = result.score;
            move = { i, j };
          }
        }
      }
    }
  }
  return { score: bestScore, move: move };
}

// Les fonctions isBoardFull et hasPlayerWon sont des exemples de fonctions que vous devrez implémenter.
// Elles vérifient respectivement si le plateau de jeu est plein et si un joueur a gagné.

function isBoardFull(board) {
  // Retourne true si le plateau est plein, sinon false
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] == null) {
        return false;
      }
    }
  }
  return true;
}

function hasPlayerWon(board, player) {
  // Vérifie les lignes
  for (let i = 0; i < 3; i++) {
    if (
      board[i][0] === player &&
      board[i][1] === player &&
      board[i][2] === player
    ) {
      return true;
    }
  }

  // Vérifie les colonnes
  for (let i = 0; i < 3; i++) {
    if (
      board[0][i] === player &&
      board[1][i] === player &&
      board[2][i] === player
    ) {
      return true;
    }
  }

  // Vérifie la diagonale de gauche à droite
  if (
    board[0][0] === player &&
    board[1][1] === player &&
    board[2][2] === player
  ) {
    return true;
  }

  // Vérifie la diagonale de droite à gauche
  if (
    board[0][2] === player &&
    board[1][1] === player &&
    board[2][0] === player
  ) {
    return true;
  }

  // Si aucune des conditions ci-dessus n'est vraie, alors le joueur n'a pas gagné
  return false;
}
