import { Route, Routes } from "react-router-dom";
import WelcomeGamePage from "../pages/WelcomeGamePage";
import GameSettingsPage from "../pages/GameSettingsPage";
import GameBattleShipPage from "../pages/GameBattleShipPage";
import NotFound from "../components/NotFound";
import PlayerInfo from "../components/PlayerInfo";
import PlayerInfoPage from "../pages/PlayerInfoPage";

const RouterApp = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomeGamePage />} />
      <Route path="/playerInfo" element={<PlayerInfoPage />} />
      <Route path="/settingsGame" element={<GameSettingsPage />} />
      <Route path="/game" element={<GameBattleShipPage />} />
      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
};

export default RouterApp;
