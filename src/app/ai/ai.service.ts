import { Injectable } from '@angular/core';
import { BoardService } from '../game-board/board.service';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  model: any;
  phase: string = 'training';
  actions: string[] = ['LEFT', 'RIGHT', 'DOWN'];
  neurons: number = 6;

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

  trainModel() {
    let reward = 1;
    if (this.phase === 'training') {
      const inputTensor = this.getInputTensor();
      inputTensor.print();
      const outputTensor = this.getOutputTensor(
        inputTensor,
        this.chooseAction(),
        reward
      );
      outputTensor.print();

      this.model.fit(inputTensor, outputTensor).then(() => {
        console.log('model trained');
      });
    }
  }

  chooseAction() {
    let actionIndex = -1;

    if (this.phase === 'training') {
      //choose randomly
      actionIndex = Math.floor(Math.random() * 3 + 0);
      console.log(
        `Action ${this.actions[actionIndex]} chosen with index ${actionIndex}`
      );
    } else {
      //choose from model
      const inputTensor = this.getInputTensor();
      const outputs = this.model.predict(inputTensor).arraySync()[0];
      //get max
      actionIndex = this.getMaxIndex(outputs);
    }

    return actionIndex;
  }

  getInputTensor() {
    let col1 = 0;
    let col2 = 0;
    let col3 = 0;
    let x = 1;
    let y = 0;
    let inputs = [col1, col2, col3, x, y];

    return tf.tensor2d(inputs, [1, inputs.length]);
  }

  getOutputTensor(inputTensor, actionIndex: number, reward: number) {
    const predictedOutput = this.model.predict(inputTensor).arraySync()[0];
    let correctedOutput = predictedOutput;
    correctedOutput[actionIndex] = correctedOutput[actionIndex] + reward;

    return tf.tensor2d(correctedOutput, [1, correctedOutput.length]);
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
