'use client';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const createEmptyBoard = (): (string | number)[][] =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

export const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: 'cyan',
  },
  J: {
    shape: [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    color: 'blue',
  },
  L: {
    shape: [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    color: 'orange',
  },
  O: {
    shape: [[1, 1], [1, 1]],
    color: 'yellow',
  },
  S: {
    shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    color: 'green',
  },
  T: {
    shape: [[1, 1, 1], [0, 1, 0], [0, 0, 0]],
    color: 'purple',
  },
  Z: {
    shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    color: 'red',
  },
};

export const randomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino as keyof typeof TETROMINOS];
};
