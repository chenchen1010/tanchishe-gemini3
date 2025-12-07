import React from 'react';
import { Coordinate, GameStatus } from '../types';
import { BOARD_SIZE } from '../constants';

interface GameBoardProps {
  snake: Coordinate[];
  food: Coordinate;
  obstacles: Coordinate[];
  status: GameStatus;
  aiComment: string;
  isAiLoading: boolean;
  level: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ snake, food, obstacles, status, aiComment, isAiLoading, level }) => {
  // 创建网格数组
  const grid = Array.from({ length: BOARD_SIZE * BOARD_SIZE });

  return (
    <div className="relative">
      {/* 游戏网格 */}
      <div
        className="grid bg-gray-900 border-4 border-gray-700 rounded-lg shadow-2xl overflow-hidden relative"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
          width: 'min(90vw, 500px)',
          height: 'min(90vw, 500px)',
        }}
      >
        {grid.map((_, index) => {
          const x = index % BOARD_SIZE;
          const y = Math.floor(index / BOARD_SIZE);
          
          const isFood = food.x === x && food.y === y;
          const isObstacle = obstacles.some(obs => obs.x === x && obs.y === y);
          const snakeIndex = snake.findIndex((segment) => segment.x === x && segment.y === y);
          const isHead = snakeIndex === 0;
          const isBody = snakeIndex > 0;

          let cellClass = "w-full h-full border border-gray-800/20 ";

          if (isHead) {
            cellClass += "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] z-10 rounded-sm";
          } else if (isBody) {
            // 渐变色蛇身
            cellClass += `bg-green-600 rounded-sm`;
          } else if (isFood) {
            cellClass += "bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-pulse scale-75";
          } else if (isObstacle) {
            cellClass += "bg-gray-700 border-gray-600 shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]";
          }

          return (
            <div
              key={index}
              className={cellClass}
              style={isBody ? { opacity: Math.max(0.4, 1 - snakeIndex / 20) } : {}}
            />
          );
        })}
      </div>

      {/* Game Over 遮罩层 */}
      {status === GameStatus.GAME_OVER && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm rounded-lg animate-in fade-in duration-300 z-50">
          <h2 className="text-4xl font-black text-red-500 mb-2 drop-shadow-lg">GAME OVER</h2>
          <p className="text-gray-400 mb-4 text-sm uppercase tracking-widest">Reached Level {level}</p>
          
          <div className="mt-2 p-4 bg-gray-800/90 rounded-xl border border-gray-600 max-w-[90%] w-full shadow-2xl">
            <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
              <span>🤖</span> AI 辣评
            </h3>
            {isAiLoading ? (
               <div className="flex justify-center items-center py-2 space-x-2">
                 <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                 <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               </div>
            ) : (
              <p className="text-gray-200 italic font-medium leading-relaxed text-sm">
                "{aiComment}"
              </p>
            )}
          </div>
        </div>
      )}

       {/* Paused 遮罩层 */}
       {status === GameStatus.PAUSED && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px] z-40">
          <h2 className="text-3xl font-bold text-yellow-400 tracking-widest animate-pulse">PAUSED</h2>
        </div>
      )}
    </div>
  );
};

export default GameBoard;