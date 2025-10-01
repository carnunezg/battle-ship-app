import { createContext, useState } from "react";
import { createEmptyBoard } from "../utils/createEmptyBoard";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState("");

  const [playerBoard, setPlayerBoard] = useState(createEmptyBoard());

  return (
    <PlayerContext.Provider
      value={{ player, setPlayer, playerBoard, setPlayerBoard }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
