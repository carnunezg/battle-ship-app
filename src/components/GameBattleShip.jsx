import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { ships } from "../utils/consts";
import { createEmptyBoard } from "../utils/createEmptyBoard";
import { launchConfetti } from "../utils/launchConfetti";

const GameBattleShip = () => {
  const { player, playerBoard } = useContext(PlayerContext);

  const [computerBoard, setComputerBoard] = useState([]);
  const [shots, setShots] = useState([]);
  const [turn, setTurn] = useState("player");
  const [computerShots, setComputerShots] = useState([]);
  const [message, setMessage] = useState("");
  const [sunkPlayerShips, setSunkPlayerShips] = useState([]);
  const [sunkComputerShips, setSunkComputerShips] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [messageWinner, setMessageWinner] = useState("");

  const totalComputerShips = ships.reduce((acc, ship) => acc + ship.count, 0);
  const totalPlayerShips = ships.reduce((acc, ship) => acc + ship.count, 0);

  useEffect(() => {
    setComputerBoard(generateComputerBoard());
  }, []);

  useEffect(() => {
    console.table(computerBoard);
  }, [computerBoard]);

  useEffect(() => {
    if (turn === "computer") {
      setTimeout(() => {
        computerShoot();
      }, 500);
    }
  }, [turn]);

  const generateComputerBoard = () => {
    const board = createEmptyBoard();

    ships.forEach((ship) => {
      let placed = 0;

      while (placed < ship.count) {
        const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);

        let canPlace = true;
        const positions = [];

        // Validar posiciones
        Array.from({ length: ship.size }).forEach((_, i) => {
          const xi = orientation === "vertical" ? x + i : x;
          const yi = orientation === "horizontal" ? y + i : y;

          if (xi >= 10 || yi >= 10 || board[xi][yi]) {
            canPlace = false;
          } else {
            positions.push({ xi, yi });
          }
        });

        // Colocar barco si es válido
        if (canPlace) {
          positions.forEach(({ xi, yi }) => {
            board[xi][yi] = `${ship.name}-${placed + 1}`;
          });
          placed++;
        }
      }
    });

    return board;
  };

  const resetGame = () => {
    setComputerBoard(generateComputerBoard());
    setShots([]);
    setComputerShots([]);
    setSunkPlayerShips([]);
    setSunkComputerShips([]);
    setGameOver(false);
    setTurn("player");
    setMessage("");
    setMessageWinner("");
  };

  const handleCellClick = (x, y) => {
    if (turn !== "player" || gameOver) return;

    const alreadyShot = shots.find((s) => s.x === x && s.y === y);
    if (alreadyShot) return;

    const cell = computerBoard[x][y];
    const result = cell ? "hit" : "miss";

    const newShots = [...shots, { x, y, result }];
    setShots(newShots);

    if (result === "hit") {
      const shipName = cell;

      if (
        !sunkComputerShips.includes(shipName) &&
        checkIfShipSunk(computerBoard, newShots, shipName)
      ) {
        const updatedSunkShips = [...sunkComputerShips, shipName];
        setSunkComputerShips(updatedSunkShips);
        setMessage(`¡Hundiste el ${shipName.split("-")[0]} del computador!`);
        setTimeout(() => {
          setMessage("");
        }, 2000);

        if (updatedSunkShips.length === totalComputerShips) {
          setMessageWinner("Hundiste todos los barcos del Computador.");
          launchConfetti();
          setGameOver(true);
          return;
        }
      }
    }

    setTurn("computer");
  };

  const computerShoot = () => {
    if (gameOver) return;

    let x, y, alreadyShot;

    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      alreadyShot = computerShots.find((s) => s.x === x && s.y === y);
    } while (alreadyShot);

    const cell = playerBoard[x][y];
    const result = cell ? "hit" : "miss";

    const newShots = [...computerShots, { x, y, result }];
    setComputerShots(newShots);

    if (result === "hit") {
      const shipName = cell;

      if (
        !sunkPlayerShips.includes(shipName) &&
        checkIfShipSunk(playerBoard, newShots, shipName)
      ) {
        const updatedSunkShips = [...sunkPlayerShips, shipName];
        setSunkPlayerShips(updatedSunkShips);
        setMessage(`¡El computador hundió tu ${shipName.split("-")[0]}!`);
        setTimeout(() => {
          setMessage("");
        }, 2000);

        if (updatedSunkShips.length === totalPlayerShips) {
          setMessageWinner("El Computador hundió todos tus barcos.");
          setGameOver(true);
          return;
        }
      }
    }

    setTurn("player");
  };

  const getCellClass = (x, y) => {
    const shot = shots.find((s) => s.x === x && s.y === y);
    if (!shot) return "";

    return shot.result === "hit" ? "cell-hit" : "cell-miss";
  };

  const getPlayerCellClass = (x, y) => {
    const shot = computerShots.find((s) => s.x === x && s.y === y);
    const cell = playerBoard[x][y];

    if (!shot) {
      return cell ? cell.split("-")[0].toLowerCase() : "";
    }

    return shot.result === "hit" ? "cell-hit" : "cell-miss";
  };
  const checkIfShipSunk = (board, shots, shipName) => {
    const positions = [];

    board.forEach((row, x) => {
      row.forEach((cell, y) => {
        if (cell === shipName) {
          positions.push({ x, y });
        }
      });
    });

    return positions.every((pos) =>
      shots.some(
        (shot) => shot.x === pos.x && shot.y === pos.y && shot.result === "hit"
      )
    );
  };

  return (
    <main className="background-animated">
      <section className="modal">
        {message && (
          <div className="message-warning">
            <p>{message}</p>
          </div>
        )}

        {messageWinner && (
          <div
            className={
              sunkComputerShips.length === totalComputerShips
                ? "message-winner"
                : "message-game-over"
            }
          >
            <h2>
              {sunkComputerShips.length === totalComputerShips
                ? "¡GANASTE!"
                : "¡PERDISTE!"}
            </h2>
            <p>{messageWinner}</p>
          </div>
        )}

        <section className="container-info">
          <div className="card-info-player">
            <h3 className="date-info">
              Jugador:{" "}
              <span className="name-player">{player || "Jugador"}</span>
            </h3>
            <p className="date-info">
              Destruidos:
              <span className="name-player"> {sunkPlayerShips.length}/6</span>
            </p>
          </div>

          <div className="card-info-pc">
            <h3 className="date-info">
              Jugador: <span className="name-player"> Computador</span>
            </h3>
            <p className="date-info">
              Destruidos:
              <span className="name-player"> {sunkComputerShips.length}/6</span>
            </p>
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
                    className={`board-cell ${getPlayerCellClass(x, y)}`}
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
