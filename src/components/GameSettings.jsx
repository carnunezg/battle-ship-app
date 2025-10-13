import { Link } from "react-router-dom";
import "../css/GameSettings.css";
import { useState, useContext, useEffect } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom";
import { ships } from "../utils/consts";
import { createEmptyBoard } from "../utils/createEmptyBoard";

const GameSettings = () => {
  const { setPlayer, setPlayerBoard } = useContext(PlayerContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const isNameEntered = name.trim() !== "";
  const [localBoard, setLocalBoard] = useState(createEmptyBoard());

  const [selectedShip, setSelectedShip] = useState(null);
  const [orientation, setOrientation] = useState("horizontal");
  const [placedShips, setPlacedShips] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isNameEntered && !selectedShip) {
      const nextShip = orderedShips.find(
        (ship) => (placedShips[ship.name] || 0) < ship.count
      );
      if (nextShip) {
        setSelectedShip(nextShip);
      }
    }
  }, [name, placedShips, selectedShip]);

  useEffect(() => {
    if (name.trim() === "") {
      reset();
    }
  }, [name]);

  const orderedShips = [...ships].sort((a, b) => b.size - a.size);

  const getNextShipToPlace = () => {
    let next = null;
    orderedShips.forEach((ship) => {
      const placed = placedShips[ship.name] || 0;
      if (next === null && placed < ship.count) {
        next = ship.name;
      }
    });
    return next;
  };

  const handleCellClick = (x, y) => {
    const allShipsPlaced = ships.every(
      (ship) => (placedShips[ship.name] || 0) === ship.count
    );

    if (allShipsPlaced) {
      setMessage("Ya colocaste todos los barcos.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const currentCount = placedShips[selectedShip.name] || 0;

    const newBoard = localBoard.map((row) => [...row]);
    const size = selectedShip.size;

    let validPlacement = true;
    const positions = [];

    Array.from({ length: size }).forEach((_, i) => {
      const xi = orientation === "vertical" ? x + i : x;
      const yi = orientation === "horizontal" ? y + i : y;

      if (xi >= 10 || yi >= 10 || newBoard[xi][yi]) {
        validPlacement = false;
      } else {
        positions.push({ xi, yi });
      }
    });

    if (!validPlacement) {
      setMessage("No puedes colocar el barco en esa posición.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    positions.forEach(({ xi, yi }) => {
      newBoard[xi][yi] = `${selectedShip.name}-${currentCount + 1}`;
    });

    setLocalBoard(newBoard);
    setPlacedShips((prev) => {
      const updated = {
        ...prev,
        [selectedShip.name]: currentCount + 1,
      };

      const remaining = selectedShip.count - (updated[selectedShip.name] || 0);
      if (remaining === 0) {
        let nextShip = null;
        orderedShips.forEach((ship) => {
          const placed = updated[ship.name] || 0;
          if (!nextShip && placed < ship.count) {
            nextShip = ship;
          }
        });

        if (nextShip) {
          setSelectedShip(nextShip);
        } else {
          setSelectedShip(null);
          setMessage("Ya colocaste todos los barcos.");
          setTimeout(() => setMessage(""), 3000);
        }
      }

      return updated;
    });
  };

  const reset = () => {
    setName("");
    setLocalBoard(createEmptyBoard());
    setPlacedShips({});
    setOrientation("horizontal");
    setSelectedShip(null);
    setPlayerBoard([]);
  };

  const handleShipSelect = (e, ship) => {
    e.preventDefault();
    setSelectedShip(ship);
    setMessage("");
  };

  const isReadyToPlay =
    name.trim() !== "" &&
    ships.every((ship) => (placedShips[ship.name] || 0) === ship.count);

  const handleStartClick = () => {
    setPlayer(name);
    setPlayerBoard(localBoard);
    navigate("/game");
  };

  return (
    <main className="background-animated">
      <section className="modal">
        {message && (
          <div>
            <p className="message-warning">{message}</p>
          </div>
        )}
        <div>
          <h2 className="title-h2">Configuración del Juego</h2>

          <div className="container-form-boars">
            <div className="card">
              <div className="container-title">
                <label className="title-h3">Configura tus barcos</label>
              </div>

              <form className="container-form">
                <input
                  className="input"
                  type="text"
                  placeholder="Nombre del Jugador"
                  maxLength={8}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <div className="container-select">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="orientation"
                      value="horizontal"
                      checked={orientation === "horizontal"}
                      onChange={(e) => setOrientation(e.target.value)}
                      disabled={!name.trim()}
                    />
                    Horizontal
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="orientation"
                      value="vertical"
                      checked={orientation === "vertical"}
                      onChange={(e) => setOrientation(e.target.value)}
                      disabled={!name.trim()}
                    />
                    Vertical
                  </label>
                </div>

                <div>
                  <section className="container-buttons">
                    {orderedShips.map((ship) => {
                      const remaining =
                        ship.count - (placedShips[ship.name] || 0);
                      const nextShip = getNextShipToPlace();
                      const isEnabled = isNameEntered && ship.name === nextShip;

                      return (
                        <button
                          className={`button-ship ${
                            selectedShip?.name === ship.name ? "selected" : ""
                          }`}
                          key={ship.name}
                          disabled={!isEnabled}
                          onClick={(e) => handleShipSelect(e, ship)}
                        >
                          {ship.name} <br /> ({ship.size} celdas) <br />
                          Cantidad: {remaining}
                        </button>
                      );
                    })}
                  </section>
                </div>
              </form>
            </div>

            <div className="board-grid">
              {localBoard.map((row, x) =>
                row.map((cell, y) => (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => isNameEntered && handleCellClick(x, y)}
                    className={`board-cell ${
                      cell ? cell.split("-")[0].toLowerCase() : ""
                    } ${!isNameEntered ? "disabled" : ""}`}
                  />
                ))
              )}
            </div>
          </div>

          <section className="box-buttons">
            {name.trim() !== "" && (
              <Link className="link">
                <button className="button-back" onClick={reset}>
                  Restablecer
                </button>
              </Link>
            )}

            <Link className="link" to={isReadyToPlay ? "/game" : "#"}>
              <button
                className={`button-start ${!isReadyToPlay ? "disabled" : ""}`}
                onClick={handleStartClick}
                disabled={!isReadyToPlay}
              >
                Comenzar
              </button>
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
};

export default GameSettings;
