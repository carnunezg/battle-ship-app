import { Link } from "react-router-dom";

const GameSettings = () => {
  return (
    <div>
      <h1>Configuración del Juego</h1>
      <Link to="/game">
        <button>Jugar</button>
      </Link>
    </div>
  );
};

export default GameSettings;
