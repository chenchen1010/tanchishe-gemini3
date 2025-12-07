import React from 'react';
import { Direction, GameStatus } from '../types';

interface ControlPanelProps {
  onDirectionChange: (dir: Direction) => void;
  onAction: (action: 'START' | 'PAUSE' | 'RESET') => void;
  status: GameStatus;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onDirectionChange, onAction, status }) => {
  const btnClass = "w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl active:bg-gray-700 shadow-lg border-2 border-gray-700 select-none touch-manipulation";

  const renderArrowButton = (dir: Direction, icon: string) => (
    <button
      className={btnClass}
      onClick={(e) => {
        e.preventDefault();
        onDirectionChange(dir);
      }}
      onTouchStart={(e) => {
         e.preventDefault(); // 防止默认触摸行为
         onDirectionChange(dir);
      }}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-md">
      {/* 游戏状态控制按钮 */}
      <div className="flex gap-4">
        {status === GameStatus.IDLE || status === GameStatus.GAME_OVER ? (
          <button
            onClick={() => onAction('START')}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95"
          >
            {status === GameStatus.GAME_OVER ? '重玩一次' : '开始游戏'}
          </button>
        ) : (
          <button
            onClick={() => onAction(status === GameStatus.PLAYING ? 'PAUSE' : 'START')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white shadow-lg transition-all active:scale-95"
          >
            {status === GameStatus.PLAYING ? '暂停' : '继续'}
          </button>
        )}
      </div>

      {/* 移动端虚拟方向键 - 仅在移动端布局显示，这里为了演示默认显示，可以通过CSS控制 */}
      <div className="grid grid-cols-3 gap-2 mt-2 md:hidden">
        <div />
        {renderArrowButton(Direction.UP, '▲')}
        <div />
        {renderArrowButton(Direction.LEFT, '◀')}
        {renderArrowButton(Direction.DOWN, '▼')}
        {renderArrowButton(Direction.RIGHT, '▶')}
      </div>
      
      <div className="hidden md:block text-gray-400 text-sm mt-2">
        使用键盘方向键控制移动
      </div>
    </div>
  );
};

export default ControlPanel;