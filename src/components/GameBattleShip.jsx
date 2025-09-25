import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";

const ships = [
  { name: "Portaaviones", size: 5, count: 1 },
  { name: "Acorazado", size: 4, count: 1 },
  { name: "Crucero", size: 3, count: 2 },
  { name: "Submarino", size: 2, count: 2 },
];

const createEmptyBoard = () =>
  Array(10)
    .fill(null)
    .map(() => Array(10).fill(null));

const GameBattleShip = () => {
  const { player, playerBoard } = useContext(PlayerContext);
  const [computerBoard, setComputerBoard] = useState([]);
  const [shots, setShots] = useState([]);

  useEffect(() => {
    setComputerBoard(generateComputerBoard());
  }, []);

  const generateComputerBoard = () => {
    const board = createEmptyBoard();

    for (const ship of ships) {
      let placed = 0;
      while (placed < ship.count) {
        const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);

        let canPlace = true;
        for (let i = 0; i < ship.size; i++) {
          const xi = orientation === "vertical" ? x + i : x;
          const yi = orientation === "horizontal" ? y + i : y;

          if (xi >= 10 || yi >= 10 || board[xi][yi]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < ship.size; i++) {
            const xi = orientation === "vertical" ? x + i : x;
            const yi = orientation === "horizontal" ? y + i : y;
            board[xi][yi] = ship.name;
          }
          placed++;
        }
      }
    }

    return board;
  };

  const resetGame = () => {
    setComputerBoard(generateComputerBoard());
    setShots([]);
  };

  const handleCellClick = (x, y) => {
    const alreadyShot = shots.find((s) => s.x === x && s.y === y);
    if (alreadyShot) return;

    const cell = computerBoard[x][y];
    const result = cell ? "hit" : "miss";

    setShots((prev) => [...prev, { x, y, result }]);
  };

  const getCellClass = (x, y) => {
    const shot = shots.find((s) => s.x === x && s.y === y);
    if (!shot) return "";

    return shot.result === "hit" ? "cell-hit" : "cell-miss";
  };

  return (
    <main className="background-animated">
      <section className="modal">
        <h2 className="title-h2">Bienvenido a la Batalla</h2>

        <section className="container-info">
          <div className="card-info-player">
            <h3 className="title-h3">{player || "Jugador"}</h3>
          </div>

          <div className="card-info-pc">
            <h3 className="title-h3">Computador</h3>
          </div>
        </section>

        <div className="container-form-boars">
          <div>
            <div className="board-grid">
              {computerBoard.map((row, x) =>
                row.map((cell, y) => (
                  <div
                    key={`computer-${x}-${y}`}
                    className={`board-cell ${getCellClass(x, y)}`}
                    onClick={() => handleCellClick(x, y)}
                  />
                ))
              )}
            </div>
          </div>

          <label className="title-vs">VS</label>

          <div>
            <div className="board-grid">
              {playerBoard.map((row, x) =>
                row.map((cell, y) => (
                  <div
                    key={`player-${x}-${y}`}
                    className={`board-cell ${cell ? cell.toLowerCase() : ""}`}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="box-buttons">
          <Link className="link" to="/settings-game">
            <button className="button-back-setting">Volver a configurar</button>
          </Link>
          <Link className="link">
            <button className="button-reset" onClick={resetGame}>
              Reiniciar Juego
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default GameBattleShip;
