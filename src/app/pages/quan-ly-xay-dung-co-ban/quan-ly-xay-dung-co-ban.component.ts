import { Component, OnInit } from '@angular/core';
import { openingBalanceService } from '../_services/opening-balance.service';
import { CONFIG } from 'src/app/utils/constants';

@Component({
  selector: 'app-quan-ly-xay-dung-co-ban',
  templateUrl: './quan-ly-xay-dung-co-ban.component.html',
  styleUrls: ['./quan-ly-xay-dung-co-ban.component.scss']
})
export class QuanLyXayDungCoBanComponent implements OnInit {
  userName: string;
  constructor(private openingBalanceService: openingBalanceService) { }

  ngOnInit(): void {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.initCombobox();
  }

  initCombobox() {
    let reqGetListStatus = {userName: this.userName };
    this.openingBalanceService.getListOrganisation(reqGetListStatus, 'get-list-organisation', true);
  }
}
