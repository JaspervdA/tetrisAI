import { Component, OnInit } from '@angular/core';
import { BoardService } from '../board.service';
import { AiService } from '../../ai/ai.service';
import { HostListener } from '@angular/core';

export enum KEY_CODE {
  LEFT_ARROW = 37,
  UP_ARROW = 38,
  RIGHT_ARROW = 39,
  DOWN_ARROW = 40
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.sass']
})
export class BoardComponent implements OnInit {
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode == KEY_CODE.DOWN_ARROW) {
      this.boardService.downKeyPress();
    } else if (event.keyCode == KEY_CODE.UP_ARROW) {
      this.boardService.upKeyPress();
    } else if (event.keyCode == KEY_CODE.LEFT_ARROW) {
      this.boardService.leftKeyPress();
    } else if (event.keyCode == KEY_CODE.RIGHT_ARROW) {
      this.boardService.rightKeyPress();
    }
  }

  constructor(
    private boardService: BoardService,
    private aiService: AiService
  ) {}

  ngOnInit() {}

  newGameClick() {
    this.boardService.gameIsOver = false;
    this.boardService.newGame();
  }

  trainAiClick() {
    this.aiService.training = true;
    this.aiService.createTrainingModels();
    this.aiService.trainGenerations();
    // this.aiService.visualiseModel();
  }
  playTrainedAiClick() {
    this.aiService.training = false;
    this.aiService.playTrainedModel();
  }
}
