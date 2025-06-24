import React from 'react';

const BoltBadge = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:scale-105 transition-transform duration-200"
      >
        <img
          src="/white_circle_360x360.png"
          alt="Powered by Bolt.new"
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        />
      </a>
    </div>
  );
};

export default BoltBadge;