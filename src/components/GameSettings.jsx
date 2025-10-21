import { Link } from "react-router-dom";
import "../css/GameSettings.css";
import { useState, useContext, useEffect } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom";
import { ships, directions } from "../utils/consts";
import { createEmptyBoard } from "../utils/createEmptyBoard";
import BoardCell from "./BoardCell";
import DirectionSelector from "./DirectionSelector";

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
  const [disabledDirections, setDisabledDirections] = useState(directions);
  const [hoveredShip, setHoveredShip] = useState(null);
  const [editingShipId, setEditingShipId] = useState(null);

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

  useEffect(() => {
    if (!previewPosition || !selectedShip) return;

    const newDisabled = {
      up: !isValidPlacement(
        previewPosition.x,
        previewPosition.y,
        "up",
        selectedShip.size
      ),
      down: !isValidPlacement(
        previewPosition.x,
        previewPosition.y,
        "down",
        selectedShip.size
      ),
      left: !isValidPlacement(
        previewPosition.x,
        previewPosition.y,
        "left",
        selectedShip.size
      ),
      right: !isValidPlacement(
        previewPosition.x,
        previewPosition.y,
        "right",
        selectedShip.size
      ),
    };

    setDisabledDirections(newDisabled);
  }, [previewPosition, selectedShip]);

  const isValidPlacement = (x, y, direction, size) => {
    const newBoard = localBoard;
    const positions = [];
    let isValid = true;

    Array.from({ length: size }).forEach((_, i) => {
      let xi = x;
      let yi = y;

      if (direction === "right") yi += i;
      if (direction === "left") yi -= i;
      if (direction === "down") xi += i;
      if (direction === "up") xi -= i;

      if (xi < 0 || xi >= 10 || yi < 0 || yi >= 10 || newBoard[xi][yi]) {
        isValid = false;
        return;
      }

      positions.push({ xi, yi });
    });

    return isValid ? positions : null;
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

  const handleMouseEnter = (x, y) => {
    const cell = localBoard[x][y];
    if (cell && !editingShipId && !previewPosition) {
      const [shipName] = cell.split("-");
      setMessage(`Haz clic para editar la posición del "${shipName}"`);
      setHoveredShip(cell);
    }
  };

  const handleMouseLeave = () => {
    setMessage("");
    setHoveredShip(null);
  };

  const handleEditShip = (shipId) => {
    const positions = [];
    localBoard.forEach((row, x) => {
      row.forEach((cell, y) => {
        if (cell === shipId) {
          positions.push({ xi: x, yi: y });
        }
      });
    });

    if (positions.length === 0) return;

    let orientationDetected = "right";
    if (positions.length > 1) {
      const dx = positions[1].xi - positions[0].xi;
      const dy = positions[1].yi - positions[0].yi;

      if (dx === 1) orientationDetected = "down";
      else if (dx === -1) orientationDetected = "up";
      else if (dy === 1) orientationDetected = "right";
      else if (dy === -1) orientationDetected = "left";
    }

    const newBoard = localBoard.map((row) =>
      row.map((cell) => (cell === shipId ? null : cell))
    );

    const [shipName] = shipId.split("-");
    const updatedCount = (placedShips[shipName] || 1) - 1;

    setLocalBoard(newBoard);
    setPlacedShips((prev) => ({
      ...prev,
      [shipName]: updatedCount,
    }));

    const shipData = ships.find((s) => s.name === shipName);
    setEditingShipId(shipId);
    setSelectedShip(shipData);
    setOrientation(orientationDetected);

    const first = positions[0];
    setPreviewPosition({ x: first.xi, y: first.yi });
    setPreviewPositions(positions);
    setShowDirectionSelector(true);
  };

  const handleCellClickWrapper = (cell, x, y) => {
    if (!isNameEntered) return;

    if (editingShipId && !cell) {
      handleCellClick(x, y);
      return;
    }

    if (selectedShip && !editingShipId && !cell) {
      handleCellClick(x, y);
      return;
    }

    if (cell && !editingShipId && !previewPosition) {
      handleEditShip(cell);
    }
  };

  const handleMouseEnterWrapper = (x, y) => {
    handleMouseEnter(x, y);
  };

  const handleShipClick = (e, ship) => {
    handleShipSelect(e, ship);
  };

  const isShipEnabled = (ship) => {
    const nextShip = getNextShipToPlace();
    return isNameEntered && ship.name === nextShip;
  };

  const getShipButtonClass = (ship) => {
    return `button-ship ${selectedShip?.name === ship.name ? "selected" : ""}`;
  };

  return (
    <main className="background-animated">
      <section className="modal">
        {message && (
          <div>
            <p
              className={
                message.includes("editar")
                  ? "message-player"
                  : "message-warning"
              }
            >
              {message}
            </p>
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

                <div>
                  <section className="container-buttons">
                    {orderedShips.map((ship) => {
                      const remaining =
                        ship.count - (placedShips[ship.name] || 0);

                      return (
                        <button
                          key={ship.name}
                          className={getShipButtonClass(ship)}
                          disabled={!isShipEnabled(ship)}
                          onClick={(e) => handleShipClick(e, ship)}
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
                  <BoardCell
                    key={`${x}-${y}`}
                    cell={cell}
                    x={x}
                    y={y}
                    isNameEntered={isNameEntered}
                    previewPositions={previewPositions}
                    hoveredShip={hoveredShip}
                    editingShipId={editingShipId}
                    previewPosition={previewPosition}
                    handleCellClickWrapper={handleCellClickWrapper}
                    handleMouseEnterWrapper={handleMouseEnterWrapper}
                    handleMouseLeave={handleMouseLeave}
                  />
                ))
              )}

              {showDirectionSelector && previewPosition && (
                <DirectionSelector
                  disabledDirections={disabledDirections}
                  previewPosition={previewPosition}
                  setPreviewPositions={setPreviewPositions}
                  selectedShip={selectedShip}
                  previewPositions={previewPositions}
                  isValidPlacement={isValidPlacement}
                  setOrientation={setOrientation}
                  setLocalBoard={setLocalBoard}
                  setSelectedShip={setSelectedShip}
                  localBoard={localBoard}
                  setShowDirectionSelector={setShowDirectionSelector}
                  setPreviewPosition={setPreviewPosition}
                  placedShips={placedShips}
                  setPlacedShips={setPlacedShips}
                  orderedShips={orderedShips}
                  setEditingShipId={setEditingShipId}
                />
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
