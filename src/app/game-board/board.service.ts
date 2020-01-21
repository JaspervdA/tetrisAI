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
      this.spawnTetrisBlock();
    } else if (this.downBlockHit()) {
      this.spawnTetrisBlock();
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

  flipTetrisBlock(tetrisBlock: boolean[][]) {
    console.log(
      tetrisBlock[0].map((col, i) => tetrisBlock.map(row => row[i]).reverse())
    );
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
    let blockHeight = this.currentTetrisBlock.length;
    let hit = false;
    let lowestBlockRow = this.currentTetrisBlock.slice(-1)[0];
    let secondLowestBlockRow = this.currentTetrisBlock.slice(-2)[0];
    let thirdLowestBlockRow = this.currentTetrisBlock.slice(-3)[0];

    // Evaluate lowest row of tetris block
    lowestBlockRow.forEach((value, colIndex) => {
      value && this.state[this.currentY + blockHeight][this.currentX + colIndex]
        ? (hit = true)
        : null;
    });

    // Evaluate second-lowest row of tetris block
    secondLowestBlockRow.forEach((value, colIndex) => {
      if (value && !lowestBlockRow[colIndex]) {
        // If there is a gap below the current block in the second lowest row
        if (this.currentY + blockHeight - 1 > -1) {
          value &&
          this.state[this.currentY + blockHeight - 1][this.currentX + colIndex]
            ? (hit = true)
            : null;
        }
      }
    });

    // Evaluate second-lowest row of tetris block
    thirdLowestBlockRow.forEach((value, colIndex) => {
      if (value && !secondLowestBlockRow[colIndex]) {
        // If there is a gap below the current block in the second lowest row
        if (this.currentY + blockHeight - 2 > -1) {
          value &&
          this.state[this.currentY + blockHeight - 2][this.currentX + colIndex]
            ? (hit = true)
            : null;
        }
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
    console.log(mostLeftColumns);

    // Check whether any of the most left blocks hits an existing block
    let hit = false;
    mostLeftColumns.forEach((colIndex, rowIndex) => {
      if (this.state[this.currentY + rowIndex][this.currentX + colIndex - 1]) {
        hit = true;
      }
    });
    return hit;
  }

  rightBlockHit() {
    // // Find the index of the most left blocks in the tetris block
    // let mostRightColumns = new Array();
    // this.currentTetrisBlock.forEach(blockRow => {
    //   mostRightColumns.push(
    //     blockRow.length - blockRow.reverse().findIndex(value => value === true)
    //   );
    // });
    // console.log(mostRightColumns);
    //
    // // Check whether any of the most left blocks hits an existing block
    // let hit = false;
    // mostRightColumns.forEach((colIndex, rowIndex) => {
    //   if (this.state[this.currentY + rowIndex][this.currentX + colIndex - 1]) {
    //     hit = true;
    //   }
    // });
    return false;
  }
}
