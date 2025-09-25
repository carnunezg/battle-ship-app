import { createContext, useState } from "react";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState("");

  const createEmptyBoard = () =>
    Array(10)
      .fill(null)
      .map(() => Array(10).fill(null));

  const [playerBoard, setPlayerBoard] = useState(createEmptyBoard());

  return (
    <PlayerContext.Provider
      value={{ player, setPlayer, playerBoard, setPlayerBoard }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
