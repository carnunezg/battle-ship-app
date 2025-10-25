export const generateComputerBoard = (ships, createEmptyBoard) => {
  const board = createEmptyBoard();

  ships.forEach((ship) => {
    let placed = 0;

    while (placed < ship.count) {
      const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
      const x = Math.floor(Math.random() * 10);
      const y = Math.floor(Math.random() * 10);

      let canPlace = true;
      const positions = [];

      Array.from({ length: ship.size }).forEach((_, i) => {
        const xi = orientation === "vertical" ? x + i : x;
        const yi = orientation === "horizontal" ? y + i : y;

        if (xi >= 10 || yi >= 10 || board[xi][yi]) {
          canPlace = false;
        } else {
          positions.push({ xi, yi });
        }
      });

      if (canPlace) {
        positions.forEach(({ xi, yi }) => {
          Array.from({ length: 3 }).forEach((_, dx) => {
            Array.from({ length: 3 }).forEach((_, dy) => {
              const nx = xi + dx - 1;
              const ny = yi + dy - 1;

              if (
                nx >= 0 &&
                nx < 10 &&
                ny >= 0 &&
                ny < 10 &&
                board[nx][ny] &&
                !positions.some((pos) => pos.xi === nx && pos.yi === ny)
              ) {
                canPlace = false;
              }
            });
          });
        });
      }

      if (canPlace) {
        positions.forEach(({ xi, yi }) => {
          board[xi][yi] = `${ship.name}-${placed + 1}`;
        });
        placed++;
      }
    }
  });

  return board;
};
