import { Injectable } from '@angular/core';
import { BoardService } from '../game-board/board.service';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import { Subscription, interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  model: any;
  training: boolean = false;
  actions: string[] = ['LEFT', 'RIGHT', 'DOWN'];
  neurons: number = 6;
  trainingGamesPlayed: number = 0;
  trainingGames: number = 100;
  timerSubscribtion: Subscription;

  constructor(private boardService: BoardService) {}

  createModel() {
    // Define a model for linear regression.
    this.model = tf.sequential();
    // Add a single hidden layer
    this.model.add(
      tf.layers.dense({
        inputShape: [this.boardService.boardWidth + 2],
        units: this.neurons
      })
    );

    // Add an output layer with a size equal to the number of actions it should predict
    this.model.add(tf.layers.dense({ units: this.actions.length }));
    this.model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
  }

  visualiseModel() {
    tfvis.show.modelSummary({ name: 'Model Summary' }, this.model);
  }

  async trainModel() {
    this.trainingGamesPlayed = 0;
    for (
      this.trainingGamesPlayed;
      this.trainingGamesPlayed < this.trainingGames;
      this.trainingGamesPlayed++
    ) {
      this.boardService.newGame();
      while (!this.boardService.gameIsOver) {
        const inputTensor = this.getInputTensor();
        const outputTensor = this.getOutputTensor(inputTensor);

        await this.model.fit(inputTensor, outputTensor);
      }
    }
  }

  playTrainedModel() {
    if (this.model) {
      this.boardService.newGame();
      this.timerSubscribtion = interval(50).subscribe((val: number) => {
        if (this.boardService.gameIsOver) {
          this.timerSubscribtion.unsubscribe();
        } else {
          const inputTensor = this.getInputTensor();
          inputTensor.print();
          this.chooseAction(inputTensor);
        }
      });
    } else {
      alert('You did not train a model yet!');
    }
  }

  chooseAction(inputTensor) {
    let actionIndex = -1;
    //choose action from model
    const outputs = this.model.predict(inputTensor).arraySync()[0];
    console.log(outputs);

    if (this.training) {
      //choose randomly 50/50 of the time
      let randomActionFraction = this.trainingGamesPlayed / this.trainingGames;
      if (Math.random() > randomActionFraction * 2) {
        // Select random action
        actionIndex = Math.floor(Math.random() * 3 + 0);
        this.performAction(actionIndex);
      } else {
        // Select action from model
        actionIndex = this.getMaxIndex(outputs);
        this.performAction(actionIndex);
      }
    } else {
      //get max Action Index from model
      actionIndex = this.getMaxIndex(outputs);
      this.performAction(actionIndex);
    }

    return actionIndex;
  }

  getInputTensor() {
    let inputs = this.getInputsFromState();

    return tf.tensor2d(inputs, [1, inputs.length]);
  }

  getOutputTensor(inputTensor) {
    this.boardService.aiReward = 0;
    const actionIndex = this.chooseAction(inputTensor);
    const reward = this.boardService.aiReward;
    console.log(reward);
    const predictedOutput = this.model.predict(inputTensor).arraySync()[0];
    console.log(`Model is training, predicted output: ${predictedOutput}`);
    let correctedOutput = predictedOutput;
    correctedOutput[actionIndex] = correctedOutput[actionIndex] + reward;

    return tf.tensor2d(correctedOutput, [1, correctedOutput.length]);
  }

  getInputsFromState() {
    let virtualState = JSON.parse(JSON.stringify([...this.boardService.state]));
    let virtualBlock = JSON.parse(
      JSON.stringify(this.boardService.currentTetrisBlock)
    );
    this.boardService.removeTetrisBlock(virtualBlock, virtualState);

    let columnHeights = new Array(this.boardService.boardWidth).fill(
      this.boardService.boardHeight - 1
    );

    virtualState.forEach((row, rowIndex) => {
      columnHeights = columnHeights.map((column, colHeightIndex) => {
        if (row[colHeightIndex] && rowIndex < column) {
          return rowIndex;
        } else {
          return column;
        }
      });
    });
    let x = this.boardService.currentX;
    let y = this.boardService.currentY;
    return [...columnHeights, x, y];
  }

  performAction(index: number) {
    if (index === 0) {
      this.boardService.leftKeyPress();
    } else if (index === 1) {
      this.boardService.rightKeyPress();
    } else if (index === 2) {
      this.boardService.downKeyPress();
    } else {
      console.log('Illegal action chosen');
    }
  }

  getMaxIndex(array: number[]) {
    if (array.length === 0) {
      return -1;
    }

    let max = array[0];
    let maxIndex = 0;

    for (var i = 1; i < array.length; i++) {
      if (array[i] > max) {
        maxIndex = i;
        max = array[i];
      }
    }

    return maxIndex;
  }
}
