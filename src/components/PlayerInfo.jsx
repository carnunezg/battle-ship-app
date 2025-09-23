import { Link } from "react-router-dom";
import "../css/PlayerInfo.css";
const PlayerInfo = () => {
  return (
    <main className="background-animated">
      <section className="modal">
        <div className="card">
          <h2 className="title-h2">Ingresa tu nombre</h2>
          <form className="form-input">
            <input
              className="input"
              type="text"
              placeholder="Nombre del Jugador"
              maxLength={8}
            />
            <section className="box-buttons">
              <Link className="link" to="/">
                <button className="button-back">Volver</button>
              </Link>

              <Link className="link" to="/game">
                <button className="button-start">Jugar</button>
              </Link>
            </section>
          </form>
        </div>
      </section>
    </main>
  );
};

export default PlayerInfo;
