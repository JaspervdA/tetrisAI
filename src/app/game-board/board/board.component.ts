import { Component, OnInit } from '@angular/core';
import { BoardService } from '../board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.sass']
})
export class BoardComponent implements OnInit {
  constructor(private boardService: BoardService) {
    this.boardService.initialiseBoard();
  }

  ngOnInit() {
    this.boardService.spawnTetrisBlock();
  }
}
