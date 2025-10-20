const BoardCell = ({
  cell,
  x,
  y,
  isNameEntered,
  previewPositions,
  hoveredShip,
  editingShipId,
  previewPosition,
  handleCellClickWrapper,
  handleMouseEnterWrapper,
  handleMouseLeave,
}) => {
  const isPreview = previewPositions.some((p) => p.xi === x && p.yi === y);
  const shipClass = cell ? cell.split("-")[0].toLowerCase() : "";
  const isHovered = hoveredShip && cell === hoveredShip;
  const isOtherShip =
    cell && ((editingShipId && cell !== editingShipId) || previewPosition);

  const getCellClass = () => {
    return `
      board-cell
      ${cell ? "ship-cell" : ""}
      ${shipClass}
      ${isPreview && !cell ? "preview" : ""}
      ${isHovered ? "hovered-ship" : ""}
      ${isOtherShip ? "disabled-ship" : ""}
      ${!isNameEntered ? "disabled" : ""}
    `.trim();
  };

  return (
    <div
      key={`${x}-${y}`}
      onClick={() => handleCellClickWrapper(cell, x, y)}
      onMouseEnter={() => handleMouseEnterWrapper?.(x, y)}
      onMouseLeave={handleMouseLeave}
      className={getCellClass(cell, x, y)}
    />
  );
};

export default BoardCell;
