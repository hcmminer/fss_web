import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { DatePipe } from '@angular/common';
import { Component, Inject, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { GlobalService } from 'src/app/pages/_services/global.service';
import { arrayToTree } from 'src/app/utils/functions';
import { AddTieuChiComponent } from '../add-tieu-chi/add-tieu-chi.component';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { QuanLyKpiService } from 'src/app/pages/_services/quan-ly-kpi.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-bo-tieu-chi',
  templateUrl: './bo-tieu-chi.component.html',
  styleUrls: ['./bo-tieu-chi.component.scss'],
})
export class BoTieuChiComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  inputDate = new Date();
  beginContractDate;
  expiredContractDate;
  t1msg;
  t2msg = '';
  t3msg = '';
  searchForm: FormGroup;
  addEditForm: FormGroup;
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
    'action',
  ];

  hasChild = (_: number, node) => node.expandable;

  constructor(
    private activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public translate: TranslateService,
    public toastrService: ToastrService,
    private globalService: GlobalService,
    public quanLyKpiService: QuanLyKpiService,
    public fb: FormBuilder,
    public spinner: NgxSpinnerService,
    @Inject(Injector) private readonly injector: Injector,
  ) {}

  ngOnInit(): void {
    this.getMaxDateContract();
    this.loadSearhForm();
    this.loadAddEditForm();
    const saveEvent = this.quanLyKpiService.savedListKpiEvent.subscribe(() => {
      this.dataSource.data = arrayToTree(this.convertLang(this.quanLyKpiService.responseFromSearchKpi.value));
    });
    this.subscriptions.push(saveEvent);
  }

  getMaxDateContract() {
    this.globalService.globalApi({}, 'getMaxDateContract').subscribe((res) => {
      if (res.errorCode === '0') {
        this.inputDate = res.data;
        this.eSearch();
      } else {
        this.toastrService.error(res.description);
      }
    });
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
      lstKpiManagerDTO: [],
      lstKpiManagerDTODelete: [
        {
          kpiManagerId: item.kpiManagerId,
        },
      ],
    };
    return this.globalService.globalApi(requestTarget, 'addOrUpdateKpiManager');
  }


  eChangeListKpi() {
    this.quanLyKpiService.changeListKpi(true);
  }

  eDelete(item) {
    this.spinner.show();
    setTimeout(() => this.spinner.hide(), 400);
    let oldArr = this.quanLyKpiService.responseFromSearchKpi.value;
    let currentItem = item.kpiManagerId;
    oldArr = oldArr.filter((item) => item.kpiManagerId != currentItem);
    this.quanLyKpiService.responseFromSearchKpi.next(oldArr);
    this.eChangeListKpi();
  }

  apiSaveAll() {
    const req = {};
    return this.globalService.globalApi(req, '');
  }

  // common modal confirm alert
  eSaveAll() {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('FUNCTION.CONFIRM_SAVE_ALL'),
      continue: true,
      cancel: true,
      btn: [
        { text: this.translate.instant('CANCEL'), className: 'btn-outline-warning btn uppercase mx-2' },
        { text: this.translate.instant('CONTINUE'), className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      () => {
        let request = this.apiSaveAll().subscribe((res) => {
          if (res.errorCode === '0') {
            this.toastrService.success(this.translate.instant('FUNCTION.SUCCSESS_SAVE_ALL'));
            this.activeModal.close();
          } else {
            this.toastrService.error(res.description);
          }
        });
        this.subscriptions.push(request);
      },
      () => {},
    );
  }

  eSearch() {
    const req = {
      userName: localStorage.getItem('userName'),
      dateInput: this.searchForm?.get('inputDate')?.value,
    };
    const res = this.globalService.globalApi(req, 'searchKpiManager').subscribe((res) => {
      if (res.errorCode == '0') {
        this.quanLyKpiService.responseFromSearchKpi.next(res.data);
        this.dataSource.data = arrayToTree(this.convertLang(res.data));
      } else {
        this.quanLyKpiService.responseFromSearchKpi.next(null);
      }
    });
  }

  eResetForm() {
    this.t1msg = '';
    this.loadSearhForm();
  }

  eResetForm2() {
    this.t2msg = '';
    this.t3msg = '';
    this.loadAddEditForm();
  }

  loadSearhForm() {
    this.searchForm = this.fb.group({
      inputDate: [this.inputDate, [Validators.required]],
    });
  }

  eDuyet() {}

  dateNow = new Date();

  loadAddEditForm() {
    this.addEditForm = this.fb.group({
      beginContractDate: [new Date(this.dateNow.getFullYear(), this.dateNow.getMonth(), 1), [Validators.required]],
      expiredContractDate: [
        new Date(this.dateNow.getFullYear(), this.dateNow.getMonth() + 1, 0),
        [Validators.required],
      ],
    });
  }


  eChangeDate1(event) {
    if (event.target.value === '') {
      this.t1msg = this.translate.instant('VALIDATION.REQUIRED', {
        name: this.translate.instant('TITLE.INPUT_DATE'),
      });
      return;
    }
    let temp = this.transform(this.searchForm.get('inputDate').value);
    if (temp === null || temp === undefined) {
      this.t1msg = this.translate.instant('VALIDATION.INVALID_FORMAT', {
        name: this.translate.instant('TITLE.INPUT_DATE'),
      });
      return;
    }
    this.t1msg = '';
  }

  //thay đổi format date
  transform(value: string) {
    let datePipe = new DatePipe('en-US');
    value = datePipe.transform(value, 'dd/MM/yyyy');
    return value;
  }

  eChangeDate2(event) {
    if (event.target.value === '') {
      this.t2msg = this.translate.instant('VALIDATION.REQUIRED', {
        name: this.translate.instant('TITLE.BEGIN_CONTRACT_DATE'),
      });
      return;
    }

    let temp = this.transform(this.addEditForm.get('beginContractDate').value);
    if (temp === null || temp === undefined) {
      this.t2msg = this.translate.instant('VALIDATION.INVALID_FORMAT', {
        name: this.translate.instant('TITLE.BEGIN_CONTRACT_DATE'),
      });
      return;
    }

    this.t2msg = '';
  }

  eChangeDate3(event) {
    if (event.target.value === '') {
      this.t3msg = this.translate.instant('VALIDATION.REQUIRED', {
        name: this.translate.instant('TITLE.EXPIRED_CONTRACT_DATE'),
      });
      return;
    }
    let temp = this.transform(this.addEditForm.get('expiredContractDate').value);
    if (temp === null || temp === undefined) {
      this.t3msg = this.translate.instant('VALIDATION.INVALID_FORMAT', {
        name: this.translate.instant('TITLE.EXPIRED_CONTRACT_DATE'),
      });
      return;
    }
    this.t3msg = '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
