import { Link } from "react-router-dom";
import "../css/WelcomeGame.css";
import "../index.css";

const WelcomeGame = () => {
  return (
    <main className="background-animated ">
      <section className="modal">
        <div>
          <h1 className="main-title">Batalla Naval</h1>
        </div>

        <div className="button-welcome">
          <Link className="link" to="/settings-game">
            <button className="button">Comenzar Juego</button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default WelcomeGame;
