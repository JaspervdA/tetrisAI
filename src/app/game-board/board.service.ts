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
    let initialX = Math.floor((this.boardWidth - newBlock[0].length) / 2);

    newBlock.forEach((newBlockRow, rowIndex) => {
      newBlockRow.forEach(
        (value, colIndex) => (this.state[rowIndex][initialX + colIndex] = value)
      );
    });
  }

  onKeydown(event: KeyboardEvent) {
    console.log('keydown pressed');
  }
}
