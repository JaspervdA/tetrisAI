import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.sass']
})
export class BlockComponent implements OnInit {
  @Input() filled: boolean;

  constructor() {}

  ngOnInit() {}
}
