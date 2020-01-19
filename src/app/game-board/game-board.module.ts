import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './board/board.component';
import { BlockComponent } from './block/block.component';
import { RowComponent } from './row/row.component';

@NgModule({
  declarations: [BoardComponent, BlockComponent, RowComponent],
  imports: [CommonModule],
  exports: [BoardComponent]
})
export class GameBoardModule {}
