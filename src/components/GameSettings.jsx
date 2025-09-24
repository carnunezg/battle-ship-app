import { Link } from "react-router-dom";
import "../css/GameSettings.css";
import { useState } from "react";

const ships = [
  { name: "Portaaviones", size: 5, count: 1 },
  { name: "Acorazado", size: 4, count: 1 },
  { name: "Crucero", size: 3, count: 2 },
  { name: "Submarino", size: 2, count: 2 },
];

const GameSettings = () => {
  const [name, setName] = useState("");
  const [playerBoard, setPlayerBoard] = useState(createEmptyBoard());
  const [selectedShip, setSelectedShip] = useState(null);
  const [orientation, setOrientation] = useState("horizontal");
  const [placedShips, setPlacedShips] = useState({});
  const [message, setMessage] = useState("");

  function createEmptyBoard() {
    return Array(10)
      .fill(null)
      .map(() => Array(10).fill(null));
  }

  const handleCellClick = (x, y) => {
    if (!selectedShip) return;

    const currentCount = placedShips[selectedShip.name] || 0;
    if (currentCount >= selectedShip.count) {
      setMessage(`Ya colocaste todos los "${selectedShip.name}".`);
      setTimeout(() => {
        setMessage("");
      }, 2000);

      return;
    }

    const newBoard = playerBoard.map((row) => [...row]);
    const size = selectedShip.size;

    let canPlace = true;
    for (let i = 0; i < size; i++) {
      const xi = orientation === "vertical" ? x + i : x;
      const yi = orientation === "horizontal" ? y + i : y;

      if (xi >= 10 || yi >= 10 || newBoard[xi][yi]) {
        canPlace = false;
        break;
      }
    }

    if (canPlace) {
      for (let i = 0; i < size; i++) {
        const xi = orientation === "vertical" ? x + i : x;
        const yi = orientation === "horizontal" ? y + i : y;
        newBoard[xi][yi] = selectedShip.name;
      }
      setPlayerBoard(newBoard);
      setPlacedShips((prev) => ({
        ...prev,
        [selectedShip.name]: currentCount + 1,
      }));
    }
  };

  const reset = () => {
    setName("");
    setPlayerBoard(createEmptyBoard());
    setPlacedShips({});
    setOrientation("horizontal");
    setSelectedShip(null);
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
                  <label className="title-label">Orientación: </label> <br />
                  <select
                    className="select-direction"
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value)}
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                  </select>
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
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedShip(ship);
                            setMessage("");
                          }}
                        >
                          {ship.name} ({ship.size} celdas) <br /> Cantidad:{" "}
                          {remaining}
                        </button>
                      );
                    })}
                  </section>
                </div>
              </form>
            </div>

            <div className="board-grid">
              {playerBoard.map((row, x) =>
                row.map((cell, y) => (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className={`board-cell ${cell ? "filled" : ""}`}
                  />
                ))
              )}
            </div>
          </div>

          <section className="box-buttons">
            <Link className="link">
              <button className="button-back" onClick={reset}>
                Reiniciar
              </button>
            </Link>

            <Link className="link" to="/game">
              <button className="button-start">Jugar</button>
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
};

export default GameSettings;
