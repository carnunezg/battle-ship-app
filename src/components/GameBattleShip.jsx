import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { ships } from "../utils/consts";
import { createEmptyBoard } from "../utils/createEmptyBoard";
import { computerShoot } from "../utils/computerShoot";
import { generateComputerBoard } from "../utils/generateBoard";
import { checkIfShipSunk } from "../utils/checkIfShipSunk";

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
    setComputerBoard(generateComputerBoard(ships, createEmptyBoard));
  }, []);

  useEffect(() => {
    console.table(computerBoard);
  }, [computerBoard]);

  useEffect(() => {
    if (turn === "computer") {
      setTimeout(() => {
        computerShoot({
          gameOver,
          targetMode,
          computerShots,
          playerBoard,
          setComputerShots,
          setTurn,
          targetHits,
          setTargetHits,
          setTargetMode,
          targetDirection,
          targetQueue,
          setTargetDirection,
          sunkPlayerShips,
          checkIfShipSunk,
          setTargetQueue,
          setSunkPlayerShips,
          setMessageComputer,
          setMessage,
          setMessageWinner,
          setGameOver,
          totalPlayerShips,
        });
      }, 1000);
    }
  }, [turn]);

  const resetGame = () => {
    setComputerBoard(generateComputerBoard(ships, createEmptyBoard));
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
