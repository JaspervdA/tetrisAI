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

  gameOver() {
    alert('Game over');
    this.newGame();
  }

  newGame() {
    this.initialiseBoard();
    this.spawnTetrisBlock();
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
      this.addTetrisBlock(newBlock);
    } else {
      this.gameOver();
    }
  }

  addTetrisBlock(tetrisBlock: boolean[][]) {
    tetrisBlock.forEach((blockRow, rowIndex) => {
      blockRow.forEach((value, colIndex) => {
        if (value) {
          this.state[this.currentY + rowIndex][
            this.currentX + colIndex
          ] = value;
        }
      });
    });
  }

  removeTetrisBlock(tetrisBlock: boolean[][]) {
    tetrisBlock.forEach((blockRow, rowIndex) => {
      blockRow.forEach((value, colIndex) => {
        if (value) {
          this.state[this.currentY + rowIndex][
            this.currentX + colIndex
          ] = false;
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
      this.removeTetrisBlock(this.currentTetrisBlock);
      this.currentX = this.currentX - 1;
      this.addTetrisBlock(this.currentTetrisBlock);
    }
  }

  rightKeyPress() {
    if (this.rightBoundaryHit()) {
      console.log('right boundary hit');
    } else if (this.rightBlockHit()) {
      console.log('right block hit');
    } else {
      this.removeTetrisBlock(this.currentTetrisBlock);
      this.currentX = this.currentX + 1;
      this.addTetrisBlock(this.currentTetrisBlock);
    }
  }
  downKeyPress() {
    if (this.bottomBoundaryHit()) {
      this.newTurn();
    } else if (this.downBlockHit()) {
      this.newTurn();
    } else {
      this.removeTetrisBlock(this.currentTetrisBlock);
      this.currentY = this.currentY + 1;
      this.addTetrisBlock(this.currentTetrisBlock);
    }
  }

  upKeyPress() {
    this.removeTetrisBlock(this.currentTetrisBlock);
    this.currentTetrisBlock = this.flipTetrisBlock(this.currentTetrisBlock);
    this.addTetrisBlock(this.currentTetrisBlock);
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

  leftBoundaryHit() {
    return this.currentX < 1;
  }

  rightBoundaryHit() {
    return (
      this.currentX + this.currentTetrisBlock[0].length > this.boardWidth - 1
    );
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

  rightBlockHit() {
    // Find the index of the most right blocks in the tetris block
    let mostRightColumns = new Array();
    this.currentTetrisBlock.forEach(blockRow => {
      let reversedRow = [...blockRow].reverse();
      mostRightColumns.push(
        blockRow.length - 1 - reversedRow.findIndex(value => value === true)
      );
    });

    // Check whether any of the most right blocks hit an existing block
    let hit = false;
    mostRightColumns.forEach((colIndex, rowIndex) => {
      if (this.state[this.currentY + rowIndex][this.currentX + colIndex + 1]) {
        hit = true;
      }
    });
    return hit;
  }

  clearFullRows() {
    let fullRows = [];
    this.state.forEach((row, rowIndex) => {
      if (row.every(value => value === true)) {
        fullRows.push(rowIndex);
      }
    });
    fullRows.forEach(rowIndex => this.removeFullRow(rowIndex));
  }

  removeFullRow(rowIndex: number) {
    this.state.splice(rowIndex, 1);
    let newRow = new Array(this.boardWidth).fill(false);
    this.state.splice(1, 0, newRow);
  }
}
