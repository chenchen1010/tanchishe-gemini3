import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Coordinate, Direction, GameStatus } from './types';
import { 
  BOARD_SIZE, 
  INITIAL_SNAKE, 
  INITIAL_DIRECTION, 
  INITIAL_SPEED, 
  MIN_SPEED, 
  SPEED_DECREMENT,
  LEVEL_CONFIGS,
  SCORE_PER_LEVEL
} from './constants';
import GameBoard from './components/GameBoard';
import ControlPanel from './components/ControlPanel';
import { useInterval } from './hooks/useInterval';
import { generateGameCommentary } from './services/geminiService';

const App: React.FC = () => {
  // 游戏状态
  const [snake, setSnake] = useState<Coordinate[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Coordinate>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [level, setLevel] = useState(1);
  
  // AI 相关状态
  const [aiComment, setAiComment] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 用于防止一帧内多次转向导致回头撞死
  const directionLock = useRef(false);

  // 获取当前关卡的障碍物
  const getObstacles = useCallback((currentLevel: number) => {
    // 确保关卡索引不越界，如果超过设计关卡数，循环使用最后一关或循环使用
    const levelIndex = Math.min(currentLevel - 1, LEVEL_CONFIGS.length - 1);
    return LEVEL_CONFIGS[levelIndex];
  }, []);

  // 生成食物，确保不生成在蛇身上或障碍物上
  const spawnFood = (currentSnake: Coordinate[], currentLevel: number) => {
    let newFood: Coordinate;
    let isInvalid = true;
    const obstacles = getObstacles(currentLevel);

    while (isInvalid) {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
      
      const onSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      const onObstacle = obstacles.some(obs => obs.x === newFood.x && obs.y === newFood.y);
      
      if (!onSnake && !onObstacle) {
        setFood(newFood);
        isInvalid = false;
      }
    }
  };

  // 初始化/重置游戏
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setLevel(1);
    setSpeed(INITIAL_SPEED);
    setStatus(GameStatus.PLAYING);
    setAiComment('');
    spawnFood(INITIAL_SNAKE, 1);
    directionLock.current = false;
  }, []);

  // 处理游戏结束
  const handleGameOver = async () => {
    setStatus(GameStatus.GAME_OVER);
    if (score > highScore) {
      setHighScore(score);
    }
    
    // 触发 AI 评论
    if (process.env.API_KEY) {
      setIsAiLoading(true);
      const comment = await generateGameCommentary(score, level);
      setAiComment(comment);
      setIsAiLoading(false);
    } else {
      setAiComment("未配置 API Key，无法获取毒舌评价。");
    }
  };

  // 游戏主循环逻辑
  const gameLoop = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case Direction.UP:
          newHead.y -= 1;
          break;
        case Direction.DOWN:
          newHead.y += 1;
          break;
        case Direction.LEFT:
          newHead.x -= 1;
          break;
        case Direction.RIGHT:
          newHead.x += 1;
          break;
      }

      // 1. 检查撞墙
      if (
        newHead.x < 0 ||
        newHead.x >= BOARD_SIZE ||
        newHead.y < 0 ||
        newHead.y >= BOARD_SIZE
      ) {
        handleGameOver();
        return prevSnake;
      }

      // 2. 检查障碍物
      const obstacles = getObstacles(level);
      if (obstacles.some(obs => obs.x === newHead.x && obs.y === newHead.y)) {
        handleGameOver();
        return prevSnake;
      }

      // 3. 检查撞自己 (不包括尾巴，因为尾巴会移走)
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
         // 特殊情况：如果只剩头和尾，且头追尾，正常是允许的，但这里简化为不允许
         // 修正：如果吃到了食物，尾巴不移除，所以撞尾巴也是死。如果没吃到，尾巴会移走，所以要排除尾巴。
         // 但为了简单和防止极速反向bug，我们通常判断除尾巴外的身体。
         // 这里使用简单判定：如果撞到当前存在的任何部分
         handleGameOver();
         return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // 4. 检查吃食物
      if (newHead.x === food.x && newHead.y === food.y) {
        const newScore = score + 1;
        setScore(newScore);
        
        // 检查升级
        let nextLevel = level;
        if (newScore > 0 && newScore % SCORE_PER_LEVEL === 0) {
          nextLevel = level + 1;
          setLevel(nextLevel);
        }

        // 速度逻辑：每吃一个加速，升级时可以额外加速或保持
        setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_DECREMENT));
        
        spawnFood(newSnake, nextLevel);
        // 不移除尾巴，实现增长
      } else {
        newSnake.pop(); // 移除尾巴
      }
      
      directionLock.current = false; // 解锁转向
      return newSnake;
    });
  }, [direction, food, level, score, getObstacles]);

  // 使用自定义 Hook 驱动循环
  useInterval(
    gameLoop,
    status === GameStatus.PLAYING ? speed : null
  );

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      if (directionLock.current) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== Direction.DOWN) {
            setDirection(Direction.UP);
            directionLock.current = true;
          }
          break;
        case 'ArrowDown':
          if (direction !== Direction.UP) {
            setDirection(Direction.DOWN);
            directionLock.current = true;
          }
          break;
        case 'ArrowLeft':
          if (direction !== Direction.RIGHT) {
            setDirection(Direction.LEFT);
            directionLock.current = true;
          }
          break;
        case 'ArrowRight':
          if (direction !== Direction.LEFT) {
            setDirection(Direction.RIGHT);
            directionLock.current = true;
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, status]);

  // 控制面板回调
  const handleDirectionChange = (newDir: Direction) => {
    if (status !== GameStatus.PLAYING || directionLock.current) return;

    const isOpposite = 
      (newDir === Direction.UP && direction === Direction.DOWN) ||
      (newDir === Direction.DOWN && direction === Direction.UP) ||
      (newDir === Direction.LEFT && direction === Direction.RIGHT) ||
      (newDir === Direction.RIGHT && direction === Direction.LEFT);

    if (!isOpposite) {
      setDirection(newDir);
      directionLock.current = true;
    }
  };

  const handleAction = (action: 'START' | 'PAUSE' | 'RESET') => {
    if (action === 'START' || action === 'RESET') {
      resetGame();
    } else if (action === 'PAUSE') {
      setStatus(prev => prev === GameStatus.PLAYING ? GameStatus.PAUSED : GameStatus.PLAYING);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-mono">
      {/* 头部信息 */}
      <header className="mb-6 text-center w-full max-w-md">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4 drop-shadow-sm">
          NEON SNAKE AI
        </h1>
        <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-gray-800 shadow-xl">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Level</span>
            <span className="font-black text-purple-400 text-2xl drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
              {level > LEVEL_CONFIGS.length ? 'MAX' : level}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Score</span>
            <span className="font-bold text-white text-2xl">{score}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Best</span>
            <span className="font-bold text-yellow-400 text-2xl">{highScore}</span>
          </div>
        </div>
      </header>

      {/* 游戏主区域 */}
      <main className="flex flex-col items-center">
        <GameBoard 
          snake={snake} 
          food={food} 
          obstacles={getObstacles(level)}
          status={status} 
          aiComment={aiComment}
          isAiLoading={isAiLoading}
          level={level}
        />
        
        <ControlPanel 
          onDirectionChange={handleDirectionChange} 
          onAction={handleAction} 
          status={status}
        />
      </main>

      <footer className="mt-8 text-gray-600 text-xs text-center">
        <p>Powered by React & Google Gemini 2.5</p>
      </footer>
    </div>
  );
};

export default App;