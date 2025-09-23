import { Link } from "react-router";
import "../css/NotFound.css";

const NotFound = () => {
  return (
    <main className="background-animated">
      <section className="modal">
        <h1 className="not-found-h1">404</h1>
        <p className="not-found-p">Página no encontrada</p>
        <Link to="/">
          <button className="button-not-found">Recargar</button>
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
