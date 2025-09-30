import { Link } from "react-router-dom";
import "../css/GameSettings.css";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom";

const ships = [
  { name: "Portaaviones", size: 5, count: 1 },
  { name: "Acorazado", size: 4, count: 1 },
  { name: "Crucero", size: 3, count: 2 },
  { name: "Submarino", size: 2, count: 2 },
];

function createEmptyBoard() {
  return Array(10)
    .fill(null)
    .map(() => Array(10).fill(null));
}

const GameSettings = () => {
  const { setPlayer, setPlayerBoard } = useContext(PlayerContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [localBoard, setLocalBoard] = useState(createEmptyBoard());

  const [selectedShip, setSelectedShip] = useState(null);
  const [orientation, setOrientation] = useState("horizontal");
  const [placedShips, setPlacedShips] = useState({});
  const [message, setMessage] = useState("");

  const handleCellClick = (x, y) => {
    if (!selectedShip) {
      setMessage("Debes seleccionar un barco antes de colocar.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const currentCount = placedShips[selectedShip.name] || 0;
    if (currentCount >= selectedShip.count) {
      setMessage(`Ya colocaste todos los "${selectedShip.name}".`);
      setTimeout(() => {
        setMessage("");
      }, 3000);
      return;
    }

    const newBoard = localBoard.map((row) => [...row]);
    const size = selectedShip.size;

    for (let i = 0; i < size; i++) {
      const xi = orientation === "vertical" ? x + i : x;
      const yi = orientation === "horizontal" ? y + i : y;

      if (xi >= 10 || yi >= 10) {
        setMessage(
          `Selecciona un área que contenga ${size} celdas disponibles.`
        );
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      if (newBoard[xi][yi]) {
        setMessage("No puedes colocar el barco sobre otra pieza.");
        setTimeout(() => setMessage(""), 3000);
        return;
      }
    }

    for (let i = 0; i < size; i++) {
      const xi = orientation === "vertical" ? x + i : x;
      const yi = orientation === "horizontal" ? y + i : y;
      newBoard[xi][yi] = selectedShip.name;
    }

    setLocalBoard(newBoard);
    setPlacedShips((prev) => ({
      ...prev,
      [selectedShip.name]: currentCount + 1,
    }));
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

  const handleStartClick = (e) => {
    if (!isReadyToPlay) {
      e.preventDefault();
      setMessage("Debes ingresar tu nombre y colocar todos los barcos.");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setPlayer(name);
      setPlayerBoard(localBoard);
      navigate("/game");
    }
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
                <label className="title-h3 ">Configura tus barcos</label>
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
                    />
                    Vertical
                  </label>
                </div>

                <div>
                  <section className="container-buttons">
                    {ships.map((ship) => {
                      const remaining =
                        ship.count - (placedShips[ship.name] || 0);
                      return (
                        <button
                          className={`button-ship ${
                            selectedShip?.name === ship.name ? "selected" : ""
                          }`}
                          key={ship.name}
                          disabled={remaining === 0}
                          onClick={(e) => handleShipSelect(e, ship)}
                        >
                          {ship.name} <br /> ({ship.size} celdas) <br />{" "}
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
                    onClick={() => handleCellClick(x, y)}
                    className={`board-cell ${cell ? cell.toLowerCase() : ""}`}
                  />
                ))
              )}
            </div>
          </div>

          <section className="box-buttons">
            <Link className="link">
              <button className="button-back" onClick={reset}>
                Restablecer
              </button>
            </Link>

            <Link className="link" to={isReadyToPlay ? "/game" : "#"}>
              <button className="button-start" onClick={handleStartClick}>
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
