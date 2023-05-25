import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { DatePipe } from '@angular/common';
import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RequestApiModelOld } from 'src/app/pages/_models/requestOld-api.model';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { openingBalanceService } from 'src/app/pages/_services/opening-balance.service';
import { CONFIG } from 'src/app/utils/constants';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { arrayToTree } from 'src/app/utils/functions';

@Component({
  selector: 'app-bo-tieu-chi',
  templateUrl: './bo-tieu-chi.component.html',
  styleUrls: ['./bo-tieu-chi.component.scss'],
})
export class BoTieuChiComponent implements OnInit {
  private transformer = (node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      level: level,
      kpiName: node.kpiName,
      kpiCode: node.kpiCode,
      kpiNameVi: node.kpiNameVi,
      kpiNameLa: node.kpiNameLa,
      contentVi: node.contentVi,
      contentLa: node.contentLa,
      kpiPolicyVi: node.kpiPolicyVi,
      kpiPolicyLa: node.kpiPolicyLa,
      staffCode: node.staffCode,
      kpiPoint: node.kpiPoint,
      beginContractDate: node.beginContractDate,
      expiredContractDate: node.expiredContractDate,
    };
  };
  treeControl = new FlatTreeControl<any>(
    (node) => node.level,
    (node) => node.expandable,
  );
  treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  displayedColumns: string[] = [
    'kpiName',
    'kpiCode',
    'kpiNameVi',
    'kpiNameLa',
    'contentVi',
    'contentLa',
    'kpiPolicyVi',
    'kpiPolicyLa',
    'staffCode',
    'kpiPoint',
    'beginContractDate',
    'expiredContractDate',
    'action',
  ];

  hasChild = (_: number, node) => node.expandable;

  constructor(
    public translate: TranslateService,
    public toastrService: ToastrService,
    private globalService: GlobalService,
    @Inject(Injector) private readonly injector: Injector,
  ) {
    // this.dataSource.data = datafake;
  }

  ngOnInit(): void {
    this.eSearch();
  }

  //   {
  //     "kpiManagerId": 11,
  //     "parentId": null,
  //     "kpiCode": "KPI_11",
  //     "kpiNameVi": "TEST_DUONGPT_384ddd",
  //     "kpiNameLa": "điều chỉnh",
  //     "contentVi": "test contentVi d12",
  //     "contentLa": "test contentLa",
  //     "kpiPolicyVi": "Chính sách 2",
  //     "kpiPolicyLa": "Chinh sach 2",
  //     "staffCode": "PHOUT_NOC",
  //     "kpiPoint": 5,
  //     "status": 1,
  //     "createdDatetime": "2023-05-25T17:00:01",
  //     "createdBy": "FSS_ADMIN",
  //     "lastUpdatedDatetime": "2023-05-25T18:26:01",
  //     "lastUpdatedBy": "FSS_ADMIN",
  //     "beginContractDate": "2023-05-01T00:00:00",
  //     "expiredContractDate": "2023-05-31T00:00:00"
  // },

  convertLang(arr) {
    const lang = localStorage.getItem('language');
    if (lang == 'vi') {
      return arr.map((obj) => ({ ...obj, kpiName: obj.kpiNameVi, content: obj.contentVi, kpiPolicy: obj.kpiPolicyVi }));
    }
    if (lang == 'la') {
      return arr.map((obj) => ({ ...obj, kpiName: obj.kpiNameLa, content: obj.contentLa, kpiPolicy: obj.kpiPolicyLa }));
    }
  }

  eUpdate(item) {}

  eDelete(item) {}

  applyFilter(event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    let tarArr = this.responseFromSearchApi.filter((item) =>
      Object.values(item)
        .map((item) => item?.toString().trim().toLowerCase())
        .includes(filterValue),
    );
    this.dataSource.data = arrayToTree(this.convertLang(tarArr));
    if (event.target.value == '') {
      setTimeout(() => this.eSearch(), 400);
    }
  }

  responseFromSearchApi = [];

  eSearch() {
    const req = {
      userName: localStorage.getItem('userName'),
      // kpiPeriodDTO: {},
      dateInput: '2023-05-31T00:00:00',
    };
    const res = this.globalService.globalApi(req, 'searchKpiManager').subscribe((res) => {
      if (res.errorCode == '0') {
        this.responseFromSearchApi = res.data;
        this.dataSource.data = arrayToTree(this.convertLang(res.data));
      } else {
        this.dataSource.data = null;
      }
    });
  }
}
