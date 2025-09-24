import { Route, Routes } from "react-router-dom";
import WelcomeGamePage from "../pages/WelcomeGamePage";
import GameSettingsPage from "../pages/GameSettingsPage";
import GameBattleShipPage from "../pages/GameBattleShipPage";
import NotFound from "../components/NotFound";

const RouterApp = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomeGamePage />} />
      <Route path="/settings-game" element={<GameSettingsPage />} />
      <Route path="/game" element={<GameBattleShipPage />} />
      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
};

export default RouterApp;
