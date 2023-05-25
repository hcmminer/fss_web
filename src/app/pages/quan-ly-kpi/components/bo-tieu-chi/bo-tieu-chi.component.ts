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

let fake = [
  {
    kpiManagerId: 1,
    parentId: null,
    kpiCode: 'banga',
    kpiNameVi: 'TEST_DUONGPT',
    kpiNameLa: 'điều chỉnh',
    contentVi: 'test contentVi',
    contentLa: 'test contentLa',
    kpiPolicyVi: 'Chính sách vi',
    kpiPolicyLa: 'Chinh sach la',
    staffCode: '',
    kpiPoint: 1.3,
    status: 1,
    createdDatetime: '2023-05-23T16:07:17',
    createdBy: 'FSS_ADMIN',
    lastUpdatedDatetime: '2023-05-23T16:07:17',
    lastUpdatedBy: 'FSS_ADMIN',
  },
  {
    kpiManagerId: 2,
    parentId: null,
    kpiCode: 'banga',
    kpiNameVi: 'TEST_DUONGPT',
    kpiNameLa: 'điều chỉnh',
    contentVi: 'test contentVi',
    contentLa: 'test contentLa',
    kpiPolicyVi: 'Chính sách vi',
    kpiPolicyLa: 'Chinh sach la',
    staffCode: 'PHOUT_NOC',
    kpiPoint: 5,
    status: 1,
    createdDatetime: '2023-05-23T16:27:52',
    createdBy: 'FSS_ADMIN',
    lastUpdatedDatetime: '2023-05-23T16:27:52',
    lastUpdatedBy: 'FSS_ADMIN',
  },
  {
    kpiManagerId: 3,
    parentId: 2,
    kpiCode: 'banga',
    kpiNameVi: 'TEST_DUONGPT_3',
    kpiNameLa: 'điều chỉnh',
    contentVi: 'test contentVi',
    contentLa: 'test contentLa',
    kpiPolicyVi: 'Chính sách vi',
    kpiPolicyLa: 'Chinh sach la',
    staffCode: 'PHOUT_NOC',
    kpiPoint: 5,
    status: 1,
    createdDatetime: '2023-05-23T16:28:37',
    createdBy: 'FSS_ADMIN',
    lastUpdatedDatetime: '2023-05-23T16:28:37',
    lastUpdatedBy: 'FSS_ADMIN',
  },
  {
    kpiManagerId: 4,
    parentId: 2,
    kpiCode: 'banga',
    kpiNameVi: 'TEST_DUONGPT_32a',
    kpiNameLa: 'điều chỉnh',
    contentVi: 'test contentVi d12',
    contentLa: 'test contentLa',
    kpiPolicyVi: 'Chính sách 2',
    kpiPolicyLa: 'Chinh sach 2',
    staffCode: 'PHOUT_NOC',
    kpiPoint: 3.2,
    status: 1,
    createdDatetime: '2023-05-23T16:30:25',
    createdBy: 'FSS_ADMIN',
    lastUpdatedDatetime: '2023-05-23T16:30:25',
    lastUpdatedBy: 'FSS_ADMIN',
  },
  {
    kpiManagerId: 5,
    parentId: 1,
    kpiCode: 'banga',
    kpiNameVi: 'TEST_DUONGPT_32a',
    kpiNameLa: 'điều chỉnh',
    contentVi: 'test contentVi d12',
    contentLa: 'test contentLa',
    kpiPolicyVi: 'Chính sách 2',
    kpiPolicyLa: 'Chinh sach 2',
    staffCode: 'PHOUT_NOC',
    kpiPoint: 8,
    status: 1,
    createdDatetime: '2023-05-23T16:45:45',
    createdBy: 'FSS_ADMIN',
    lastUpdatedDatetime: '2023-05-23T16:45:45',
    lastUpdatedBy: 'FSS_ADMIN',
  },
  {
    kpiManagerId: 6,
    parentId: null,
    kpiCode: 'banga',
    kpiNameVi: 'TEST_DUONGPT_32a',
    kpiNameLa: 'điều chỉnh',
    contentVi: 'test contentVi d12',
    contentLa: 'test contentLa',
    kpiPolicyVi: 'Chính sách 2',
    kpiPolicyLa: 'Chinh sach 2',
    staffCode: 'PHOUT_NOC',
    kpiPoint: 2.1,
    status: 1,
    createdDatetime: '2023-05-23T16:46:00',
    createdBy: 'FSS_ADMIN',
    lastUpdatedDatetime: '2023-05-23T16:46:00',
    lastUpdatedBy: 'FSS_ADMIN',
  },
  {
    kpiManagerId: 7,
    parentId: 3,
    kpiCode: 'banga',
    kpiNameVi: 'TEST_DUONGPT_32a',
    kpiNameLa: 'điều chỉnh',
    contentVi: 'test contentVi d12',
    contentLa: 'test contentLa',
    kpiPolicyVi: 'Chính sách 2',
    kpiPolicyLa: 'Chinh sach 2',
    staffCode: 'PHOUT_NOC',
    kpiPoint: 2.1,
    status: 1,
    createdDatetime: '2023-05-23T16:46:06',
    createdBy: 'FSS_ADMIN',
    lastUpdatedDatetime: '2023-05-23T16:46:06',
    lastUpdatedBy: 'FSS_ADMIN',
  },
  {
    kpiManagerId: 8,
    parentId: null,
    kpiCode: 'banga',
    kpiNameVi: 'Tiêu chí test',
    kpiNameLa: 'ການທົດສອບ KPI',
    contentVi: 'Đây là tiêu chí test',
    contentLa: 'ນີ້ແມ່ນເງື່ອນໄຂການສອບເສັງ',
    kpiPolicyVi: 'Tiêu chí này yêu cầu phải ABCXYZ',
    kpiPolicyLa: 'ເງື່ອນໄຂນີ້ຕ້ອງການ ABCXYZ',
    staffCode: 'TEST_KHANHND',
    kpiPoint: 5,
    status: 1,
    createdDatetime: '2023-05-24T11:31:42',
    createdBy: 'stl111004548',
    lastUpdatedDatetime: '2023-05-24T11:31:42',
    lastUpdatedBy: 'stl111004548',
  },
  {
    kpiManagerId: 9,
    parentId: 1,
    kpiCode: 'banga',
    kpiNameVi: 'TEST_DUONGPT_384ddd',
    kpiNameLa: 'điều chỉnh',
    contentVi: 'test contentVi d12',
    contentLa: 'test contentLa',
    kpiPolicyVi: 'Chính sách 2',
    kpiPolicyLa: 'Chinh sach 2',
    staffCode: 'PHOUT_NOC',
    kpiPoint: 2.1,
    status: 1,
    createdDatetime: '2023-05-25T09:22:40',
    createdBy: 'FSS_ADMIN',
    lastUpdatedDatetime: '2023-05-25T09:22:40',
    lastUpdatedBy: 'FSS_ADMIN',
  },
];

const arrayToTree = (arr, parentId = null) =>
  arr
    .filter((item) => item.parentId === parentId)
    .map((child) => ({ ...child, children: arrayToTree(arr, child.kpiManagerId) }));

const datafake = arrayToTree(fake);
const json = JSON.stringify(arrayToTree(fake), null, 2);

@Component({
  selector: 'app-bo-tieu-chi',
  templateUrl: './bo-tieu-chi.component.html',
  styleUrls: ['./bo-tieu-chi.component.scss'],
})
export class BoTieuChiComponent implements OnInit {
  private transformer = (node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      kpiNameVi: node.kpiNameVi,
      count: node.count,
      level: level,
      kpiCode: node.kpiCode,
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

  displayedColumns: string[] = ['kpiNameVi', 'kpiCode'];

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

  eSearch() {
    const req = {
      userName: localStorage.getItem('userName'),
      // kpiPeriodDTO: {},
    };
    const res = this.globalService.globalApi(req, 'searchKpiManager').subscribe((res) => {
      if (res.errorCode == '0') {
        this.dataSource.data =arrayToTree(res.data);
      } else {

      }
    });
  }
}
