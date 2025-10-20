const DirectionSelector = ({
  disabledDirections,
  previewPosition,
  setPreviewPositions,
  selectedShip,
  previewPositions,
  isValidPlacement,
  setOrientation,
  setLocalBoard,
  setSelectedShip,
  localBoard,
  setShowDirectionSelector,
  setPreviewPosition,
  placedShips,
  setPlacedShips,
  orderedShips,
  setEditingShipId,
}) => {
  const handleDirectionChange = (dir) => {
    if (!previewPosition || !selectedShip || disabledDirections[dir]) return;

    const positions = isValidPlacement(
      previewPosition.x,
      previewPosition.y,
      dir,
      selectedShip.size
    );

    setOrientation(dir);
    setPreviewPositions(positions);
  };

  const confirmPlacement = () => {
    if (!previewPosition || !selectedShip || previewPositions.length === 0)
      return;

    const currentCount = placedShips[selectedShip.name] || 0;
    const newBoard = localBoard.map((row) => [...row]);

    previewPositions.forEach(({ xi, yi }) => {
      newBoard[xi][yi] = `${selectedShip.name}-${currentCount + 1}`;
    });

    setLocalBoard(newBoard);
    setPlacedShips((prev) => {
      const updated = {
        ...prev,
        [selectedShip.name]: currentCount + 1,
      };

      const remaining = selectedShip.count - (updated[selectedShip.name] || 0);
      if (remaining === 0) {
        const nextShip = orderedShips.find(
          (ship) => (updated[ship.name] || 0) < ship.count
        );
        setSelectedShip(nextShip || null);
      } else {
        setSelectedShip(selectedShip);
      }
      setOrientation("right");
      setEditingShipId(null);

      return updated;
    });

    setShowDirectionSelector(false);
    setPreviewPosition(null);
    setPreviewPositions([]);
  };

  return (
    <div className="direction-selector">
      <button
        className="button-direction arrow-up"
        onClick={() => handleDirectionChange("up")}
        disabled={disabledDirections.up}
      ></button>
      <button
        className="button-direction arrow-left"
        onClick={() => handleDirectionChange("left")}
        disabled={disabledDirections.left}
      ></button>
      <button
        className="button-direction arrow-right"
        onClick={() => handleDirectionChange("right")}
        disabled={disabledDirections.right}
      ></button>
      <button
        className="button-direction arrow-down"
        onClick={() => handleDirectionChange("down")}
        disabled={disabledDirections.down}
      ></button>
      <button className="button-ok" onClick={confirmPlacement}>
        Add
      </button>
    </div>
  );
};

export default DirectionSelector;
