import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './board/board.component';
import { BlockComponent } from './block/block.component';
import { RowComponent } from './row/row.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [BoardComponent, BlockComponent, RowComponent],
  imports: [CommonModule, FormsModule],
  exports: [BoardComponent]
})
export class GameBoardModule {}
