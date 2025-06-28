import React, { useMemo } from 'react';

const SquareGridBackground = () => {
  // Generate squares with random animation delays
  const squares = useMemo(() => {
    const squareCount = 800; // Enough to cover various screen sizes
    return Array.from({ length: squareCount }, (_, index) => ({
      id: index,
      animationDelay: Math.random() * 8 + 's', // Random delay between 0-8 seconds
      animationDuration: (Math.random() * 3 + 2) + 's', // Random duration between 2-5 seconds
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 grid-background-container">
      {squares.map((square) => (
        <div
          key={square.id}
          className="grid-square"
          style={{
            animationDelay: square.animationDelay,
            animationDuration: square.animationDuration,
          }}
        />
      ))}
    </div>
  );
};

export default SquareGridBackground;