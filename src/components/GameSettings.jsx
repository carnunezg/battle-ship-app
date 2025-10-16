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
  const [orientation, setOrientation] = useState("right");
  const [placedShips, setPlacedShips] = useState({});
  const [message, setMessage] = useState("");

  const [previewPosition, setPreviewPosition] = useState(null);
  const [showDirectionSelector, setShowDirectionSelector] = useState(false);
  const [previewPositions, setPreviewPositions] = useState([]);

  const orderedShips = [...ships].sort((a, b) => b.size - a.size);

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

  const isValidPlacement = (x, y, direction, size) => {
    const newBoard = localBoard;
    const positions = [];

    for (let i = 0; i < size; i++) {
      let xi = x,
        yi = y;

      if (direction === "right") yi += i;
      if (direction === "left") yi -= i;
      if (direction === "down") xi += i;
      if (direction === "up") xi -= i;

      if (xi < 0 || xi >= 10 || yi < 0 || yi >= 10 || newBoard[xi][yi]) {
        return null;
      }

      positions.push({ xi, yi });
    }

    return positions;
  };

  const handleCellClick = (x, y) => {
    if (!selectedShip) return;

    const positions = isValidPlacement(x, y, orientation, selectedShip.size);

    if (!positions) {
      setMessage("No puedes colocar el barco en esa posición.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setPreviewPosition({ x, y });
    setPreviewPositions(positions);
    setShowDirectionSelector(true);
  };

  const handleDirectionChange = (dir) => {
    if (!previewPosition || !selectedShip) return;

    const positions = isValidPlacement(
      previewPosition.x,
      previewPosition.y,
      dir,
      selectedShip.size
    );

    if (!positions) {
      setMessage("No puedes colocar el barco en esa dirección.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setOrientation(dir);
    setPreviewPositions(positions);
  };

  const confirmPlacement = () => {
    if (!previewPosition || !selectedShip || previewPositions.length === 0)
      return;

    const currentCount = placedShips[selectedShip.name] || 0;
    const newBoard = localBoard.map((row) => [...row]);

    previewPositions.forEach(({ xi, yi }) => {
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
        const nextShip = orderedShips.find(
          (ship) => (updated[ship.name] || 0) < ship.count
        );
        setSelectedShip(nextShip || null);
      } else {
        setSelectedShip(selectedShip);
      }
      setOrientation("right");

      return updated;
    });

    setShowDirectionSelector(false);
    setPreviewPosition(null);
    setPreviewPositions([]);
  };

  const reset = () => {
    setName("");
    setLocalBoard(createEmptyBoard());
    setPlacedShips({});
    setOrientation("right");
    setSelectedShip(null);
    setPlayerBoard([]);
    setPreviewPosition(null);
    setShowDirectionSelector(false);
    setPreviewPositions([]);
  };

  const handleShipSelect = (e, ship) => {
    e.preventDefault();
    setSelectedShip(ship);
    setOrientation("right");
    setPreviewPosition(null);
    setPreviewPositions([]);
    setShowDirectionSelector(false);
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
            <div className={`card ${showDirectionSelector ? "card-blur" : ""}`}>
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

                {/* <div className="container-select">
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
                </div> */}

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
                row.map((cell, y) => {
                  const isPreview = previewPositions.some(
                    (p) => p.xi === x && p.yi === y
                  );
                  const shipClass = cell
                    ? cell.split("-")[0].toLowerCase()
                    : "";

                  const cellClass = `
        board-cell
        ${shipClass}
        ${!cell && isPreview ? "preview" : ""}
        ${!isNameEntered ? "disabled" : ""}
      `;

                  return (
                    <div
                      key={`${x}-${y}`}
                      onClick={() => isNameEntered && handleCellClick(x, y)}
                      className={cellClass.trim()}
                    />
                  );
                })
              )}

              {showDirectionSelector && previewPosition && (
                <div className="direction-selector">
                  <button
                    className="button-direction arrow-up"
                    onClick={() => handleDirectionChange("up")}
                  ></button>
                  <button
                    className="button-direction arrow-left"
                    onClick={() => handleDirectionChange("left")}
                  ></button>
                  <button
                    className="button-direction arrow-right"
                    onClick={() => handleDirectionChange("right")}
                  ></button>
                  <button
                    className="button-direction arrow-down"
                    onClick={() => handleDirectionChange("down")}
                  ></button>
                  <button
                    className="button-ok"
                    onClick={confirmPlacement}
                  ></button>
                </div>
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
