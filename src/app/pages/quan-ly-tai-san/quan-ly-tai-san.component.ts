import { Component, OnInit } from '@angular/core';
import { openingBalanceService } from '../_services/opening-balance.service';
import { CONFIG } from 'src/app/utils/constants';

@Component({
  selector: 'app-quan-ly-tai-san',
  templateUrl: './quan-ly-tai-san.component.html',
  styleUrls: ['./quan-ly-tai-san.component.scss']
})
export class QuanLyTaiSanComponent implements OnInit {
  userName: string;
  constructor() { }

  ngOnInit(): void {

  }

}

