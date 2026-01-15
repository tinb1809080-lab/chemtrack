
import React from 'react';
import { NFPARating } from '../types';

interface NFPADiamondProps {
  rating: NFPARating;
  size?: 'sm' | 'md' | 'lg';
}

const NFPADiamond: React.FC<NFPADiamondProps> = ({ rating, size = 'md' }) => {
  const scale = size === 'sm' ? 'w-16 h-16 text-xs' : size === 'md' ? 'w-24 h-24 text-sm' : 'w-32 h-32 text-lg';
  
  return (
    <div className={`relative ${scale} rotate-45 border border-gray-400 overflow-hidden`}>
      {/* Flammability (Red) - Top */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-500 flex items-center justify-center -rotate-45 text-white font-bold">
        <span>{rating.flammability}</span>
      </div>
      {/* Reactivity (Yellow) - Right */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-yellow-400 flex items-center justify-center -rotate-45 text-black font-bold">
        <span>{rating.instability}</span>
      </div>
      {/* Health (Blue) - Left */}
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-600 flex items-center justify-center -rotate-45 text-white font-bold">
        <span>{rating.health}</span>
      </div>
      {/* Special (White) - Bottom */}
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-white flex items-center justify-center -rotate-45 text-black font-bold">
        <span className="text-[10px] sm:text-xs">{rating.special || ''}</span>
      </div>
    </div>
  );
};

export default NFPADiamond;
