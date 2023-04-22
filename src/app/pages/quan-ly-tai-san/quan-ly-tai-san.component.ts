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
  constructor(private openingBalanceService: openingBalanceService) { }

  ngOnInit(): void {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.initCombobox();
  }

  initCombobox() {
    let reqGetListStatus = {userName: this.userName };
    this.openingBalanceService.getListOrganisation(reqGetListStatus, 'get-list-organisation', true);
    this.openingBalanceService.getCbxTypeOfAsset(reqGetListStatus, 'getCbxTypeOfAsset', true);
    this.openingBalanceService.getCbxAssetCodeTransfer(reqGetListStatus, 'get-list-transfer-asset', true);

  }
}

