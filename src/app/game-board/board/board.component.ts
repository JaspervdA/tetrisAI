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
  replayGameNumber: number;

  constructor(
    public boardService: BoardService,
    public aiService: AiService
  ) {}

  ngOnInit() {}

  newGameClick() {
    this.boardService.gameIsOver = false;
    this.boardService.newGame();
  }

  trainAiClick() {
    this.aiService.training = true;
    this.aiService.createModel();
    this.aiService.trainModel();
  }

  playTrainedAiClick() {
    this.aiService.training = false;
    this.aiService.playTrainedModel();
  }

  replayGameClick() {
    this.replayGameNumber
      ? this.aiService.replayGame(this.replayGameNumber)
      : alert('Please input a game number to replay!');
  }

  unlockReward(){
    if(this.boardService.highscore > 99){
      alert('Goed gedaan! De geheime code is iloveEllissa, vul deze snel in.')
    } else {
      alert('Behaal een score van minimaal 100 punten om je beloning te bekijken.')
    }
  }
}
