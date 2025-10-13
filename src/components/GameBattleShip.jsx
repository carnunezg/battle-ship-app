import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { ships } from "../utils/consts";
import { createEmptyBoard } from "../utils/createEmptyBoard";

const GameBattleShip = () => {
  const { player, playerBoard } = useContext(PlayerContext);

  const [computerBoard, setComputerBoard] = useState([]);
  const [shots, setShots] = useState([]);
  const [turn, setTurn] = useState("player");
  const [computerShots, setComputerShots] = useState([]);
  const [message, setMessage] = useState("");
  const [messagePlayer, setMessagePlayer] = useState("");
  const [messageComputer, setMessageComputer] = useState("");
  const [sunkPlayerShips, setSunkPlayerShips] = useState([]);
  const [sunkComputerShips, setSunkComputerShips] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [messageWinner, setMessageWinner] = useState("");
  const [targetMode, setTargetMode] = useState(false);
  const [targetHits, setTargetHits] = useState([]);
  const [targetQueue, setTargetQueue] = useState([]);
  const [targetDirection, setTargetDirection] = useState(null);

  const hasPlayerShot = shots.length > 0;

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
      }, 1000);
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

        Array.from({ length: ship.size }).forEach((_, i) => {
          const xi = orientation === "vertical" ? x + i : x;
          const yi = orientation === "horizontal" ? y + i : y;

          if (xi >= 10 || yi >= 10 || board[xi][yi]) {
            canPlace = false;
          } else {
            positions.push({ xi, yi });
          }
        });

        if (canPlace) {
          positions.forEach(({ xi, yi }) => {
            Array.from({ length: 3 }).forEach((_, dx) => {
              Array.from({ length: 3 }).forEach((_, dy) => {
                const nx = xi + dx - 1;
                const ny = yi + dy - 1;

                if (
                  nx >= 0 &&
                  nx < 10 &&
                  ny >= 0 &&
                  ny < 10 &&
                  board[nx][ny] &&
                  !positions.some((pos) => pos.xi === nx && pos.yi === ny)
                ) {
                  canPlace = false;
                }
              });
            });
          });
        }

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
        setMessagePlayer(
          `¡Hundiste el ${shipName.split("-")[0]} del computador!`
        );
        setTimeout(() => {
          setMessagePlayer("");
        }, 2000);

        if (updatedSunkShips.length === totalComputerShips) {
          setTimeout(() => {
            setMessage("¡GANASTE!");
            setMessageWinner("Hundiste todos los barcos del Computador.");
            setGameOver(true);
          }, 2000);

          return;
        }
      }
    }

    setTurn("computer");
  };

  const computerShoot = () => {
    if (gameOver) return;

    let x, y;

    const isSurroundedByShots = (x, y) => {
      const directions = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
      ];

      return directions.every(({ dx, dy }) => {
        const nx = x + dx;
        const ny = y + dy;
        return (
          nx < 0 ||
          nx >= 10 ||
          ny < 0 ||
          ny >= 10 ||
          computerShots.find((s) => s.x === nx && s.y === ny)
        );
      });
    };

    const getNextTarget = () => {
      if (targetDirection && targetHits.length >= 2) {
        const sortedHits = [...targetHits].sort((a, b) => {
          if (targetDirection === "up" || targetDirection === "down") {
            return a.x - b.x;
          } else {
            return a.y - b.y;
          }
        });

        const forward = targetDirection;
        const backward = {
          up: "down",
          down: "up",
          left: "right",
          right: "left",
        }[targetDirection];

        const getNextInDirection = (from, direction) => {
          let nx = from.x;
          let ny = from.y;

          if (direction === "up") nx -= 1;
          if (direction === "down") nx += 1;
          if (direction === "left") ny -= 1;
          if (direction === "right") ny += 1;

          const alreadyShot = computerShots.find(
            (s) => s.x === nx && s.y === ny
          );

          if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10 && !alreadyShot) {
            return { x: nx, y: ny };
          }

          return null;
        };

        const nextForward = getNextInDirection(
          sortedHits[sortedHits.length - 1],
          forward
        );
        if (nextForward) return nextForward;

        const nextBackward = getNextInDirection(sortedHits[0], backward);
        if (nextBackward) return nextBackward;

        setTargetDirection(null);
      }

      while (targetQueue.length > 0) {
        const [next, ...rest] = targetQueue;
        setTargetQueue(rest);

        const alreadyShot = computerShots.find(
          (s) => s.x === next.x && s.y === next.y
        );

        if (
          next.x >= 0 &&
          next.x < 10 &&
          next.y >= 0 &&
          next.y < 10 &&
          !alreadyShot
        ) {
          return next;
        }
      }

      setTargetMode(false);
      setTargetHits([]);
      setTargetDirection(null);
      return null;
    };
    const nextTarget = targetMode ? getNextTarget() : null;

    if (nextTarget) {
      x = nextTarget.x;
      y = nextTarget.y;
    } else {
      do {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
      } while (
        computerShots.find((s) => s.x === x && s.y === y) ||
        isSurroundedByShots(x, y)
      );
    }

    const cell = playerBoard[x][y];
    const result = cell ? "hit" : "miss";

    const newShots = [...computerShots, { x, y, result }];
    setComputerShots(newShots);

    if (result === "hit") {
      const shipName = cell;

      const updatedHits = [...targetHits, { x, y }];
      setTargetHits(updatedHits);
      setTargetMode(true);

      if (updatedHits.length >= 2 && !targetDirection) {
        const [first, second] = updatedHits;
        if (first.x === second.x) {
          setTargetDirection("right");
        } else if (first.y === second.y) {
          setTargetDirection("down");
        }
      }

      if (
        !sunkPlayerShips.includes(shipName) &&
        !checkIfShipSunk(playerBoard, newShots, shipName)
      ) {
        if (!targetDirection) {
          const directions = [
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
          ];

          const newTargets = [];
          directions.forEach(({ dx, dy }) => {
            const nx = x + dx;
            const ny = y + dy;
            if (
              nx >= 0 &&
              nx < 10 &&
              ny >= 0 &&
              ny < 10 &&
              !computerShots.find((s) => s.x === nx && s.y === ny)
            ) {
              newTargets.push({ x: nx, y: ny });
            }
          });

          setTargetQueue((prev) => [...prev, ...newTargets]);
        }
        setTurn("player");
        return;
      }

      if (
        !sunkPlayerShips.includes(shipName) &&
        checkIfShipSunk(playerBoard, newShots, shipName)
      ) {
        const updatedSunkShips = [...sunkPlayerShips, shipName];
        setSunkPlayerShips(updatedSunkShips);
        setMessageComputer(
          `¡El computador hundió tu ${shipName.split("-")[0]}!`
        );
        setTimeout(() => setMessageComputer(""), 2000);

        setTargetMode(false);
        setTargetHits([]);
        setTargetQueue([]);
        setTargetDirection(null);

        if (updatedSunkShips.length === totalPlayerShips) {
          setTimeout(() => {
            setMessage("¡PERDISTE!");
            setMessageWinner("El Computador hundió todos tus barcos.");
            setGameOver(true);
          }, 2000);
          return;
        }

        setTurn("player");
        return;
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

  const getShipSummary = (sunkShips, shipList) => {
    const summary = {};

    shipList.forEach((ship) => {
      const total = ship.count;
      const sunk = Array.from({ length: total }).filter((_, i) =>
        sunkShips.includes(`${ship.name}-${i + 1}`)
      ).length;

      summary[ship.name] = { sunk, total };
    });

    return summary;
  };
  return (
    <main className="background-animated">
      <section className="modal">
        {messagePlayer && (
          <div className="message-player">
            <p>{messagePlayer}</p>
          </div>
        )}

        {messageComputer && (
          <div className="message-computer">
            <p>{messageComputer}</p>
          </div>
        )}
        <section className="container-info">
          {gameOver ? (
            <div
              className={
                sunkComputerShips.length === totalComputerShips
                  ? "message-winner"
                  : "message-game-over"
              }
            >
              <h2>{message}</h2>
              <p>{messageWinner}</p>
            </div>
          ) : (
            <>
              <div
                className={`card-info-player ${
                  turn === "player" ? "card-turn" : ""
                }`}
              >
                <h3 className="date-info">{player || "Jugador"}</h3>

                <div className="ship-summary">
                  {Object.entries(getShipSummary(sunkPlayerShips, ships)).map(
                    ([name, { sunk, total }]) => (
                      <p
                        key={name}
                        className={`ship-summary-item ${
                          sunk === total ? "sunk" : ""
                        }`}
                      >
                        {name}{" "}
                        <span
                          className={`ship-info ${
                            sunk === total ? "ship-info-sunk" : ""
                          }`}
                        >
                          {sunk}/{total}
                        </span>
                      </p>
                    )
                  )}
                </div>
              </div>

              <div
                className={`card-info-pc ${
                  turn === "computer" ? "card-turn" : ""
                }`}
              >
                <h3 className="date-info">Computador</h3>

                <div className="ship-summary">
                  {Object.entries(getShipSummary(sunkComputerShips, ships)).map(
                    ([name, { sunk, total }]) => (
                      <p
                        key={name}
                        className={`ship-summary-item ${
                          sunk === total ? "sunk" : ""
                        }`}
                      >
                        {name}{" "}
                        <span
                          className={`ship-info ${
                            sunk === total ? "ship-info-sunk" : ""
                          }`}
                        >
                          {sunk}/{total}
                        </span>
                      </p>
                    )
                  )}
                </div>
              </div>
            </>
          )}
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

          {hasPlayerShot && (
            <Link className="link">
              <button className="button-reset" onClick={resetGame}>
                Reiniciar Juego
              </button>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
};

export default GameBattleShip;
