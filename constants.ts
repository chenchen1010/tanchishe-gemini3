import { Coordinate, Direction } from './types';

export const BOARD_SIZE = 20; // 20x20 grid
export const INITIAL_SPEED = 150; // ms per tick
export const MIN_SPEED = 50;
export const SPEED_DECREMENT = 3; // Speed up by 3ms every food eaten

export const INITIAL_SNAKE: Coordinate[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

export const INITIAL_DIRECTION = Direction.UP;

// 分数阈值：达到多少分进入下一关
export const SCORE_PER_LEVEL = 5;

// 定义关卡障碍物
// 每一关是一个坐标数组，表示墙壁的位置
export const LEVEL_CONFIGS: Coordinate[][] = [
  // Level 1: 空旷 (无障碍)
  [],
  
  // Level 2: 中间四根柱子
  [
    { x: 5, y: 5 }, { x: 14, y: 5 },
    { x: 5, y: 14 }, { x: 14, y: 14 }
  ],

  // Level 3: 二字形横梁
  [
    { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 },
    { x: 11, y: 12 }, { x: 12, y: 12 }, { x: 13, y: 12 }, { x: 14, y: 12 }, { x: 15, y: 12 }
  ],

  // Level 4: "回"字形开口盒子
  [
    // 上边
    { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 }, { x: 11, y: 4 }, { x: 12, y: 4 }, { x: 13, y: 4 }, { x: 14, y: 4 }, { x: 15, y: 4 },
    // 下边
    { x: 4, y: 15 }, { x: 5, y: 15 }, { x: 6, y: 15 }, { x: 7, y: 15 }, { x: 8, y: 15 }, { x: 11, y: 15 }, { x: 12, y: 15 }, { x: 13, y: 15 }, { x: 14, y: 15 }, { x: 15, y: 15 },
    // 左边
    { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 4, y: 13 }, { x: 4, y: 14 },
    // 右边
    { x: 15, y: 5 }, { x: 15, y: 6 }, { x: 15, y: 13 }, { x: 15, y: 14 },
  ],

  // Level 5: 乱石阵
  [
    { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 17, y: 2 }, { x: 16, y: 3 },
    { x: 2, y: 17 }, { x: 3, y: 16 }, { x: 17, y: 17 }, { x: 16, y: 16 },
    { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 }, // 中心禁止通行
    { x: 6, y: 10 }, { x: 13, y: 10 }, { x: 10, y: 6 }, { x: 10, y: 13 } 
  ]
];