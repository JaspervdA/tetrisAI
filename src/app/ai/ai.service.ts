import { Injectable } from '@angular/core';
import { BoardService } from '../game-board/board.service';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import { Subscription, interval } from 'rxjs';

interface ModelScore {
  model: any;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  population: ModelScore[];
  training: boolean = false;
  actions: string[] = ['LEFT', 'RIGHT', 'DOWN'];
  neurons: number = 6;
  populationMember: number = 0;
  timerSubscribtion: Subscription;
  populationSize: number = 10;
  generation: number = 0;
  trainingGenerations: number = 5;

  constructor(private boardService: BoardService) {}

  createModel() {
    // Define a model for linear regression.
    let model = tf.sequential();
    // Add a single hidden layer
    model.add(
      tf.layers.dense({
        inputShape: [this.boardService.boardWidth + 1],
        units: this.neurons,
        activation: 'sigmoid'
        // kernelInitializer: 'leCunNormal',
        // useBias: true,
        // biasInitializer: 'randomNormal'
      })
    );

    // Add an output layer with a size equal to the number of actions it should predict
    model.add(tf.layers.dense({ units: this.actions.length }));
    model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });
    return model;
  }

  createTrainingModels() {
    let i;
    this.population = [];
    for (i = 0; i < this.populationSize; i++) {
      this.population.push({ model: this.createModel(), score: 0 });
    }
  }

  visualiseModel(model) {
    tfvis.show.modelSummary({ name: 'Model Summary' }, model);
  }

  async trainGenerations() {
    for (
      this.generation = 0;
      this.generation < this.trainingGenerations;
      this.generation++
    ) {
      await this.trainModels();
      this.evolvePopulation();
    }
  }

  async trainModels() {
    for (
      this.populationMember = 0;
      this.populationMember < this.populationSize;
      this.populationMember++
    ) {
      this.boardService.newGame();

      while (!this.boardService.gameIsOver && this.boardService.score < 100) {
        this.population[this.populationMember].score = this.boardService.score;
        const inputTensor = this.getInputTensor();
        const outputTensor = this.getOutputTensor(
          inputTensor,
          this.population[this.populationMember].model
        );
        await this.population[this.populationMember].model.fit(
          inputTensor,
          outputTensor
        );
      }
      console.log(this.population);
    }
  }

  playTrainedModel() {
    if (this.population) {
      this.boardService.newGame();
      this.timerSubscribtion = interval(1000).subscribe((val: number) => {
        if (this.boardService.gameIsOver) {
          this.timerSubscribtion.unsubscribe();
        } else {
          const inputTensor = this.getInputTensor();
          this.chooseAction(inputTensor, this.population[0].model);
        }
      });
    } else {
      alert('You did not train a model yet!');
    }
  }

  chooseAction(inputTensor, model) {
    let actionIndex = -1;
    //choose action from model
    const outputs = model.predict(inputTensor).arraySync()[0];

    if (this.training) {
      //choose randomly for a fractino of the time
      let randomActionFraction = this.generation / this.trainingGenerations;
      if (Math.random() > randomActionFraction) {
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

  getOutputTensor(inputTensor, model) {
    this.boardService.aiReward = 0;
    const actionIndex = this.chooseAction(inputTensor, model);
    const reward = this.boardService.aiReward;
    const predictedOutput = model.predict(inputTensor).arraySync()[0];
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
    columnHeights = columnHeights.map(
      colHeight => colHeight - this.boardService.currentY
    );
    let x = this.boardService.currentX;
    return [...columnHeights, x];
  }

  performAction(index: number) {
    if (index === 0) {
      this.boardService.leftKeyPress();
    } else if (index === 1) {
      this.boardService.rightKeyPress();
    } else if (index === 2) {
      this.boardService.downKeyPress();
    } else {
      return;
    }
  }

  evolvePopulation() {
    const winners = this.getWinners();
    console.log(winners);
    const crossover1 = this.crossOver(winners[0], winners[1]);
    const crossover2 = this.crossOver(winners[0], winners[2]);
    const crossover3 = this.crossOver(winners[0], winners[3]);
    const crossover4 = this.crossOver(winners[1], winners[2]);
    const crossover5 = this.crossOver(winners[1], winners[3]);
    const crossover6 = this.crossOver(winners[2], winners[3]);

    this.population = [...winners, ...winners, winners[0], winners[1]];
  }

  crossOver(a, b) {
    const biasA = a.model.layers[0].bias.read();
    const biasB = b.model.layers[0].bias.read();

    return {
      model: this.setBias(a.model, this.exchangeBias(biasA, biasB)),
      score: 0
    };
  }

  exchangeBias(tensorA, tensorB) {
    const size = Math.ceil(tensorA.size / 2);
    return tf.tidy(() => {
      const a = tensorA.slice([0], [size]);
      const b = tensorB.slice([size], [size]);

      return a.concat(b);
    });
  }

  setBias(model, bias) {
    const newModel = Object.assign({}, model);
    newModel.layers[0].bias = newModel.layers[0].bias.write(bias);

    return newModel;
  }

  // selects the best units from the current population
  getWinners() {
    // sort the units of the current population	in descending order by their fitness
    let sortedPopulation = this.population.sort((unitA, unitB) => {
      return unitB.score - unitA.score;
    });

    // return an array of the top units from the current population
    return sortedPopulation.slice(0, 4);
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
