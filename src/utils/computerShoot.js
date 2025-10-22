export const computerShoot = ({
  gameOver,
  targetMode,
  computerShots,
  playerBoard,
  setComputerShots,
  setTurn,
  targetHits,
  setTargetHits,
  setTargetMode,
  targetDirection,
  targetQueue,
  setTargetDirection,
  sunkPlayerShips,
  checkIfShipSunk,
  setTargetQueue,
  setSunkPlayerShips,
  setMessageComputer,
  setMessage,
  setMessageWinner,
  setGameOver,
  totalPlayerShips,
}) => {
  if (gameOver) return;

  let x, y;

  const isSurroundedByShots = (x, y) => {
    const directions = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
    ];

    return directions.every(({ dx, dy }) => {
      const nx = x + dx;
      const ny = y + dy;
      return (
        nx < 0 ||
        nx >= 10 ||
        ny < 0 ||
        ny >= 10 ||
        computerShots.find((s) => s.x === nx && s.y === ny)
      );
    });
  };

  const getNextTarget = () => {
    if (targetDirection && targetHits.length >= 2) {
      const sortedHits = [...targetHits].sort((a, b) => {
        if (targetDirection === "up" || targetDirection === "down") {
          return a.x - b.x;
        } else {
          return a.y - b.y;
        }
      });

      const forward = targetDirection;
      const backward = {
        up: "down",
        down: "up",
        left: "right",
        right: "left",
      }[targetDirection];

      const getNextInDirection = (from, direction) => {
        let nx = from.x;
        let ny = from.y;

        if (direction === "up") nx -= 1;
        if (direction === "down") nx += 1;
        if (direction === "left") ny -= 1;
        if (direction === "right") ny += 1;

        const alreadyShot = computerShots.find((s) => s.x === nx && s.y === ny);

        if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10 && !alreadyShot) {
          return { x: nx, y: ny };
        }

        return null;
      };

      const nextForward = getNextInDirection(
        sortedHits[sortedHits.length - 1],
        forward
      );
      if (nextForward) return nextForward;

      const nextBackward = getNextInDirection(sortedHits[0], backward);
      if (nextBackward) return nextBackward;

      setTargetDirection(null);
    }

    while (targetQueue.length > 0) {
      const [next, ...rest] = targetQueue;
      setTargetQueue(rest);

      const alreadyShot = computerShots.find(
        (s) => s.x === next.x && s.y === next.y
      );

      if (
        next.x >= 0 &&
        next.x < 10 &&
        next.y >= 0 &&
        next.y < 10 &&
        !alreadyShot
      ) {
        return next;
      }
    }

    setTargetMode(false);
    setTargetHits([]);
    setTargetDirection(null);
    return null;
  };
  const nextTarget = targetMode ? getNextTarget() : null;

  if (nextTarget) {
    x = nextTarget.x;
    y = nextTarget.y;
  } else {
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
    } while (
      computerShots.find((s) => s.x === x && s.y === y) ||
      isSurroundedByShots(x, y)
    );
  }

  const cell = playerBoard[x][y];
  const result = cell ? "hit" : "miss";

  const newShots = [...computerShots, { x, y, result }];
  setComputerShots(newShots);

  if (result === "hit") {
    const shipName = cell;

    const updatedHits = [...targetHits, { x, y }];
    setTargetHits(updatedHits);
    setTargetMode(true);

    if (updatedHits.length >= 2 && !targetDirection) {
      const [first, second] = updatedHits;
      if (first.x === second.x) {
        setTargetDirection("right");
      } else if (first.y === second.y) {
        setTargetDirection("down");
      }
    }

    if (
      !sunkPlayerShips.includes(shipName) &&
      !checkIfShipSunk(playerBoard, newShots, shipName)
    ) {
      if (!targetDirection) {
        const directions = [
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
        ];

        const newTargets = [];
        directions.forEach(({ dx, dy }) => {
          const nx = x + dx;
          const ny = y + dy;
          if (
            nx >= 0 &&
            nx < 10 &&
            ny >= 0 &&
            ny < 10 &&
            !computerShots.find((s) => s.x === nx && s.y === ny)
          ) {
            newTargets.push({ x: nx, y: ny });
          }
        });

        setTargetQueue((prev) => [...prev, ...newTargets]);
      }
      setTurn("player");
      return;
    }

    if (
      !sunkPlayerShips.includes(shipName) &&
      checkIfShipSunk(playerBoard, newShots, shipName)
    ) {
      const updatedSunkShips = [...sunkPlayerShips, shipName];
      setSunkPlayerShips(updatedSunkShips);
      setMessageComputer(`¡El computador hundió tu ${shipName.split("-")[0]}!`);
      setTimeout(() => setMessageComputer(""), 2000);

      setTargetMode(false);
      setTargetHits([]);
      setTargetQueue([]);
      setTargetDirection(null);

      if (updatedSunkShips.length === totalPlayerShips) {
        setTimeout(() => {
          setMessage("¡PERDISTE!");
          setMessageWinner("El Computador hundió todos tus barcos.");
          setGameOver(true);
        }, 2000);
        return;
      }

      setTurn("player");
      return;
    }
  }

  setTurn("player");
};
