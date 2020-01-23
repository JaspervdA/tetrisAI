import { Injectable } from '@angular/core';
import { Subscription, interval } from 'rxjs';

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
  timerSubscribtion: Subscription;
  speed: number = 5;

  constructor() {}

  initialiseBoard() {
    this.state = [...Array(this.boardHeight)].map(x =>
      Array(this.boardWidth).fill(false)
    );
  }

  gameOver() {
    this.timerSubscribtion.unsubscribe();
    alert('Game over');
    this.newGame();
  }

  newGame() {
    this.initialiseBoard();
    this.spawnTetrisBlock();
    this.timerSubscribtion = interval(1000 / this.speed).subscribe(
      (val: number) => this.downKeyPress()
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
    this.currentY = -1;
    this.currentTetrisBlock = newBlock;
    if (!this.downBlockHit()) {
      this.currentY = 0;
      this.addTetrisBlock(newBlock, this.state);
    } else {
      this.gameOver();
    }
  }

  addTetrisBlock(tetrisBlock: boolean[][], state: boolean[][]) {
    tetrisBlock.forEach((blockRow, rowIndex) => {
      blockRow.forEach((value, colIndex) => {
        if (value) {
          state[this.currentY + rowIndex][this.currentX + colIndex] = value;
        }
      });
    });
  }

  removeTetrisBlock(tetrisBlock: boolean[][], state: boolean[][]) {
    tetrisBlock.forEach((blockRow, rowIndex) => {
      blockRow.forEach((value, colIndex) => {
        if (value) {
          state[this.currentY + rowIndex][this.currentX + colIndex] = false;
        }
      });
    });
  }

  leftKeyPress() {
    if (this.leftBoundaryHit()) {
      console.log('left boundary hit');
    } else if (this.leftBlockHit()) {
      console.log('left block hit');
    } else {
      this.removeTetrisBlock(this.currentTetrisBlock, this.state);
      this.currentX = this.currentX - 1;
      this.addTetrisBlock(this.currentTetrisBlock, this.state);
    }
  }

  rightKeyPress() {
    if (this.rightBoundaryHit(this.currentX, this.currentTetrisBlock)) {
      console.log('right boundary hit');
    } else if (
      this.rightBlockHit(this.currentTetrisBlock, this.state, this.currentX)
    ) {
      console.log('right block hit');
    } else {
      this.removeTetrisBlock(this.currentTetrisBlock, this.state);
      this.currentX = this.currentX + 1;
      this.addTetrisBlock(this.currentTetrisBlock, this.state);
    }
  }

  downKeyPress() {
    if (this.bottomBoundaryHit()) {
      this.newTurn();
    } else if (this.downBlockHit()) {
      this.newTurn();
    } else {
      this.removeTetrisBlock(this.currentTetrisBlock, this.state);
      this.currentY = this.currentY + 1;
      this.addTetrisBlock(this.currentTetrisBlock, this.state);
    }
  }

  upKeyPress() {
    if (this.legalFlip()) {
      this.removeTetrisBlock(this.currentTetrisBlock, this.state);
      this.currentTetrisBlock = this.flipTetrisBlock(this.currentTetrisBlock);
      this.addTetrisBlock(this.currentTetrisBlock, this.state);
    } else {
      console.log('illegalFlip');
    }
  }

  newTurn() {
    this.clearFullRows();
    this.spawnTetrisBlock();
  }

  flipTetrisBlock(tetrisBlock: boolean[][]) {
    return tetrisBlock[0].map((col, i) =>
      tetrisBlock.map(row => row[i]).reverse()
    );
  }

  legalFlip() {
    let virtualState = JSON.parse(JSON.stringify([...this.state]));
    let virtualBlock = JSON.parse(JSON.stringify(this.currentTetrisBlock));
    this.removeTetrisBlock(virtualBlock, virtualState);
    virtualBlock = this.flipTetrisBlock(virtualBlock);
    let rightBlockHit = this.rightBlockHit(
      virtualBlock,
      virtualState,
      this.currentX - 1
    );

    let stateHit = this.oldStateHit(virtualBlock, virtualState);
    let rightBoundaryHit = this.rightBoundaryHit(
      this.currentX - 1,
      virtualBlock
    );
    return !rightBoundaryHit && !rightBlockHit && !stateHit;
  }

  oldStateHit(virtualBlock: boolean[][], virtualState: boolean[][]) {
    let hit = false;
    virtualBlock.forEach((row, rowIndex) =>
      row.forEach((value, colIndex) => {
        if (
          value &&
          virtualState[this.currentY + rowIndex][this.currentX + colIndex]
        ) {
          hit = true;
        }
      })
    );
    return hit;
  }

  leftBoundaryHit() {
    return this.currentX < 1;
  }

  rightBoundaryHit(xPosition: number, tetrisBlock: boolean[][]) {
    return xPosition + tetrisBlock[0].length > this.boardWidth - 1;
  }

  bottomBoundaryHit() {
    return this.currentY + this.currentTetrisBlock.length === this.boardHeight;
  }

  downBlockHit() {
    // Find the index of the lowest blocks in the tetris block
    let lowestRows = new Array();
    this.currentTetrisBlock.forEach((blockRow, rowIndex) => {
      blockRow.forEach((value, colIndex) => {
        if (value) {
          lowestRows[colIndex] = rowIndex;
        }
      });
    });

    // Check whether any of the lowest blocks hit an existing block
    let hit = false;
    lowestRows.forEach((rowIndex, colIndex) => {
      if (this.state[this.currentY + rowIndex + 1][this.currentX + colIndex]) {
        hit = true;
      }
    });
    return hit;
  }

  leftBlockHit() {
    // Find the index of the most left blocks in the tetris block
    let mostLeftColumns = new Array();
    this.currentTetrisBlock.forEach(blockRow => {
      mostLeftColumns.push(blockRow.findIndex(value => value === true));
    });

    // Check whether any of the most left blocks hit an existing block
    let hit = false;
    mostLeftColumns.forEach((colIndex, rowIndex) => {
      if (this.state[this.currentY + rowIndex][this.currentX + colIndex - 1]) {
        hit = true;
      }
    });
    return hit;
  }

  rightBlockHit(
    tetrisBlock: boolean[][],
    state: boolean[][],
    currentX: number
  ) {
    // Find the index of the most right blocks in the tetris block
    let mostRightColumns = new Array();
    tetrisBlock.forEach(blockRow => {
      let reversedRow = [...blockRow].reverse();
      mostRightColumns.push(
        blockRow.length - 1 - reversedRow.findIndex(value => value === true)
      );
    });

    // Check whether any of the most right blocks hit an existing block
    let hit = false;
    mostRightColumns.forEach((colIndex, rowIndex) => {
      if (state[this.currentY + rowIndex][currentX + colIndex + 1]) {
        hit = true;
      }
    });
    return hit;
  }

  clearFullRows() {
    this.state.forEach((row, rowIndex) => {
      if (row.every(value => value === true)) {
        this.removeFullRow(rowIndex);
      }
    });
  }

  removeFullRow(rowIndex: number) {
    this.state.splice(rowIndex, 1);
    let newRow = new Array(this.boardWidth).fill(false);
    this.state.splice(1, 0, newRow);
  }
}
