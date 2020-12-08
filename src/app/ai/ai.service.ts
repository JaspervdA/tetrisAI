import { Injectable } from '@angular/core';
import { BoardService } from '../game-board/board.service';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import { Subscription, interval } from 'rxjs';

interface GameTurn {
  input: any;
  action: number;
  reward: number;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  model: any;
  games: GameTurn[][] = [];
  training: boolean = false;
  actions: string[] = ['LEFT', 'RIGHT', 'DOWN'];
  neurons: number = 12;
  trainingGamesPlayed: number = 0;
  trainingGames: number = 100;
  timerSubscription: Subscription;
  numTrainingWeights: number = 15;
  trainingWeights: number[];

  constructor(private boardService: BoardService) {}

  public createModel() {
    this.initialiseTrainingWeights();
    // Define a model for linear regression.
    this.model = tf.sequential();
    // Add a single hidden layer
    this.model.add(
      tf.layers.dense({
        inputShape: [this.boardService.boardWidth + 2],
        units: this.neurons,
        activation: 'sigmoid'
      })
    );

    // Add an output layer with a size equal to the number of actions it should predict
    this.model.add(tf.layers.dense({ units: this.actions.length }));
    this.model.compile({
      loss: 'meanSquaredError',
      optimizer: 'sgd',
      activation: 'tanh'
    });
  }

  private initialiseTrainingWeights() {
    this.trainingWeights = [];
    for (let i = 0; i < this.numTrainingWeights; i++) {
      this.trainingWeights.push(1.0 - i / this.numTrainingWeights);
    }
  }

  visualiseModel() {
    tfvis.show.modelSummary({ name: 'Model Summary' }, this.model);
  }

  public async trainModel() {
    this.trainingGamesPlayed = 0;
    this.games = [];
    for (
      this.trainingGamesPlayed;
      this.trainingGamesPlayed < this.trainingGames;
      this.trainingGamesPlayed++
    ) {
      console.log(`Game ${this.trainingGamesPlayed + 1}/${this.trainingGames}`);
      this.boardService.newGame();
      let game = this.playGame();
      this.games.push(game);
      console.log(`Game played, with ${game.length} moves`);

      console.log('Getting output Tensors');
      const weightedRewards = this.getWeightedGameRewards(game);
      const outputTensors = this.getOutputTensors(game, weightedRewards);
      // outputTensors.forEach(outputTensor => outputTensor.print());

      for (let i = 0; i < game.length; i++) {
        await this.model.fit(game[i].input, outputTensors[i]);
      }
    }
    console.log('Done!');
  }

  private getOutputTensors(game: GameTurn[], weightedRewards: number[]) {
    let outputTensors = [];
    game.forEach((turn: GameTurn, turnIndex: number) => {
      let output = this.model.predict(turn.input).arraySync()[0];
      output[turn.action] = output[turn.action] + weightedRewards[turnIndex];
      outputTensors.push(tf.tensor2d(output, [1, output.length]));
    });
    return outputTensors;
  }

  private getWeightedGameRewards(game: GameTurn[]): number[] {
    let weightedRewards = new Array(game.length).fill(0);
    game.forEach((turn: GameTurn, turnIndex: number) => {
      for (let i = 0; i < this.trainingWeights.length; i++) {
        if (turnIndex - i >= 0) {
          weightedRewards[turnIndex - i] +=
            this.trainingWeights[i] * turn.reward;
        }
      }
    });
    return weightedRewards;
  }

  private playGame(): GameTurn[] {
    let game: GameTurn[] = [];
    while (!this.boardService.gameIsOver) {
      const inputTensor = this.getInputTensor();
      this.boardService.aiReward = 0;
      const actionIndex = this.chooseAction(inputTensor);
      const reward = this.boardService.aiReward;
      game.push({ input: inputTensor, action: actionIndex, reward: reward });
    }
    return game;
  }

  public playTrainedModel() {
    if (this.model) {
      this.boardService.newGame();
      this.timerSubscription = interval(50).subscribe((val: number) => {
        if (this.boardService.gameIsOver) {
          this.timerSubscription.unsubscribe();
        } else {
          const inputTensor = this.getInputTensor();
          this.chooseAction(inputTensor);
        }
      });
    } else {
      alert('You did not train a model yet!');
    }
  }

  private chooseAction(inputTensor) {
    let actionIndex: number;

    if (this.training) {
      //choose randomly a fraction of the time that gets less with the number of training games played
      let randomActionFraction = this.trainingGamesPlayed / this.trainingGames;
      if (Math.random() > randomActionFraction) {
        // Select random action
        actionIndex = Math.floor(Math.random() * 3 + 0);
        this.performAction(actionIndex);
      } else {
        // Select action from model
        const outputs = this.model.predict(inputTensor).arraySync()[0];
        actionIndex = this.getMaxIndex(outputs);
        this.performAction(actionIndex);
      }
    } else {
      //In non-training mode, get max Action Index from model
      const outputs = this.model.predict(inputTensor).arraySync()[0];
      console.log(outputs);
      actionIndex = this.getMaxIndex(outputs);
      this.performAction(actionIndex);
    }

    return actionIndex;
  }

  private getInputTensor() {
    let inputs = this.getInputsFromState();

    return tf.tensor2d(inputs, [1, inputs.length]);
  }

  private getInputsFromState() {
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

  private performAction(index: number) {
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

  private getMaxIndex(array: number[]) {
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

  public replayGame(gameNumber: number) {
    if (this.games.length < gameNumber) {
      alert('This game number is out of range');
    } else if (this.games.length > 0) {
      const game = this.games[gameNumber - 1];
      console.log(`replaying game ${gameNumber} with length ${game.length}`);
      this.boardService.newGame();
      this.timerSubscription = interval(10).subscribe((val: number) => {
        if (val < game.length - 1) {
          this.performAction(game[val].action);
        } else {
          this.timerSubscription.unsubscribe();
          return;
        }
      });
    } else {
      alert('No training games played yet!');
    }
  }
}
