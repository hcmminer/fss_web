import { Component, OnInit } from '@angular/core';
import { CONFIG } from 'src/app/utils/constants';
import { CategoryManagerService } from '../_services/category-manager.service';

@Component({
  selector: 'app-quan-ly-danh-muc',
  templateUrl: './quan-ly-danh-muc.component.html',
  styleUrls: ['./quan-ly-danh-muc.component.scss'],
})
export class QuanLyDanhMucComponent implements OnInit {
  userName: string;
  constructor(public categoryManagerService: CategoryManagerService) {}

  ngOnInit() {
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.init();
  }

  init() {
    let requestListProvice = {
      functionName: 'getCbProvince',
      method: 'POST',
      params: {
        userName: this.userName,
      },
    };
    // lay danh sach cac tinh
    this.categoryManagerService.getListProvinceBox(requestListProvice, true);
  }
}
