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
import { AddTieuChiComponent } from '../add-tieu-chi/add-tieu-chi.component';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';

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
      kpiManagerId: node.kpiManagerId,
      parentId: node.parentId,
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
    private modalService: NgbModal,
    public translate: TranslateService,
    public toastrService: ToastrService,
    private globalService: GlobalService,
    @Inject(Injector) private readonly injector: Injector,
  ) {}

  ngOnInit(): void {
    this.eSearch();
  }

  convertLang(arr) {
    const lang = localStorage.getItem('language');
    if (lang == 'vi') {
      return arr.map((obj) => ({ ...obj, kpiName: obj.kpiNameVi, content: obj.contentVi, kpiPolicy: obj.kpiPolicyVi }));
    }
    if (lang == 'la') {
      return arr.map((obj) => ({ ...obj, kpiName: obj.kpiNameLa, content: obj.contentLa, kpiPolicy: obj.kpiPolicyLa }));
    }
  }

  eAddRoot() {
    const modalRef = this.modalService.open(AddTieuChiComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
    modalRef.result.then(() => {
      this.eSearch();
    });
  }

  eAdd(item) {
    const modalRef = this.modalService.open(AddTieuChiComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
    modalRef.componentInstance.propData = item;
    modalRef.result.then(() => {
      this.eSearch();
    });
  }

  eUpdate(item) {
    const modalRef = this.modalService.open(AddTieuChiComponent, {
      centered: true,
      backdrop: 'static',
      size: 'xl',
    });
    modalRef.componentInstance.propData = item;
    modalRef.componentInstance.isUpdate = true;
    modalRef.result.then(() => {
      this.eSearch();
    });
  }

  httpDelete(item) {
    const requestTarget = {
      userName: localStorage.getItem('userName'),
      lstKpiManagerDTODelete: [
        {
          kpiManagerId: item.kpiManagerId,
        },
      ],
    };
    return this.globalService.globalApi(requestTarget, 'addOrUpdateKpiManager');
  }

  // common modal confirm alert
  eDelete(item) {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('FUNCTION.CONFIRM_DELETE'),
      continue: true,
      cancel: true,
      btn: [
        { text: this.translate.instant('CANCEL'), className: 'btn-outline-warning btn uppercase mx-2' },
        { text: this.translate.instant('CONTINUE'), className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      () => {
        let request = this.httpDelete(item).subscribe((res) => {
          if (res.errorCode === '0') {
            this.toastrService.success(this.translate.instant('FUNCTION.SUCCSESS_DELETE'));
            // this.activeModal.close();
            this.eSearch();
          } else {
            this.toastrService.error(res.description);
          }
        });
        // this.subscriptions.push(request);
      },
      () => {},
    );
  }

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
