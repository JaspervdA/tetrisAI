import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  boardWidth: number = 10;
  boardHeight: number = 20;
  tetrisBlocks: boolean[][][] = [
    [[true, true, true, true]],
    [[true, true], [true, true]],
    [[true, false, false], [true, true, true]],
    [[false, true, false], [true, true, true]],
    [[false, false, true], [true, true, true]],
    [[true, true, false], [false, true, true]],
    [[false, true, true], [true, true, false]]
  ];
  state: boolean[][];
  currentX: number;
  currentY: number;
  currentTetrisBlock: boolean[][];

  constructor() {}

  initialiseBoard() {
    this.state = [...Array(this.boardHeight)].map(x =>
      Array(this.boardWidth).fill(false)
    );
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  newTetrisBlock() {
    return this.tetrisBlocks[this.getRandomInt(this.tetrisBlocks.length)];
  }

  spawnTetrisBlock() {
    let newBlock = this.newTetrisBlock();
    this.currentX = Math.floor((this.boardWidth - newBlock[0].length) / 2);
    this.currentY = 0;
    this.currentTetrisBlock = newBlock;
    this.addTetrisBlock(newBlock);
  }

  addTetrisBlock(tetrisBlock: boolean[][]) {
    tetrisBlock.forEach((blockRow, rowIndex) => {
      blockRow.forEach(
        (value, colIndex) =>
          (this.state[this.currentY + rowIndex][
            this.currentX + colIndex
          ] = value)
      );
    });
  }

  removeTetrisBlock(tetrisBlock: boolean[][]) {
    tetrisBlock.forEach((blockRow, rowIndex) => {
      blockRow.forEach(
        (value, colIndex) =>
          (this.state[this.currentY + rowIndex][
            this.currentX + colIndex
          ] = false)
      );
    });
  }

  leftKeyPress() {
    if (!this.leftBoundaryHit()) {
      this.removeTetrisBlock(this.currentTetrisBlock);
      this.currentX = this.currentX - 1;
      this.addTetrisBlock(this.currentTetrisBlock);
    }
  }

  rightKeyPress() {
    if (!this.rightBoundaryHit()) {
      this.removeTetrisBlock(this.currentTetrisBlock);
      this.currentX = this.currentX + 1;
      this.addTetrisBlock(this.currentTetrisBlock);
    }
  }

  downKeyPress() {
    if (!this.bottomBoundaryHit()) {
      this.removeTetrisBlock(this.currentTetrisBlock);
      this.currentY = this.currentY + 1;
      this.addTetrisBlock(this.currentTetrisBlock);
      console.log(this.currentY, this.boardHeight);
      if (this.currentY + this.currentTetrisBlock.length === this.boardHeight) {
        this.spawnTetrisBlock();
      }
    }
  }

  upKeyPress() {}

  leftBoundaryHit() {
    return this.currentX === 0;
  }

  rightBoundaryHit() {
    return (
      this.currentX + this.currentTetrisBlock[0].length === this.boardWidth
    );
  }

  bottomBoundaryHit() {
    return this.currentY + this.currentTetrisBlock.length === this.boardHeight;
  }
}
