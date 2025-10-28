export const checkIfShipSunk = (board, shots, shipName) => {
  const positions = [];

  board.forEach((row, x) => {
    row.forEach((cell, y) => {
      if (cell === shipName) {
        positions.push({ x, y });
      }
    });
  });

  return positions.every((pos) =>
    shots.some(
      (shot) => shot.x === pos.x && shot.y === pos.y && shot.result === "hit"
    )
  );
};
