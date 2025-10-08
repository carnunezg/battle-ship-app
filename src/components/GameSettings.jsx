import { Link } from "react-router-dom";
import "../css/GameSettings.css";
import { useState } from "react";
import { useContext } from "react";
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

  const handleCellClick = (x, y) => {
    if (!selectedShip) {
      setMessage("Debes seleccionar un barco.");
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
                          disabled={remaining === 0 || !isNameEntered}
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
