import { OnDestroy } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Injector,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription, BehaviorSubject } from 'rxjs';
import { CommonAlertDialogComponent } from 'src/app/pages/common/common-alert-dialog/common-alert-dialog.component';
import { RequestApiModel } from 'src/app/pages/_models/request-api.model';
import { CommonService } from 'src/app/pages/_services/common.service';
import { QuanLyPhieuCongTacService } from 'src/app/pages/_services/quanLyPhieuCongTac.service';
import { CONFIG } from 'src/app/utils/constants';

@Component({
  selector: 'app-tab-lo-trinh',
  templateUrl: './tab-lo-trinh.component.html',
  styleUrls: ['./tab-lo-trinh.component.scss'],
})
export class TabLoTrinhComponent implements OnInit, OnDestroy {
  @Output() reloadDataEvent = new EventEmitter<any>();
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  addForm: FormGroup;
  private subscriptions: Subscription[] = [];

  @ViewChild('formSearch') formSearch: ElementRef;
  isShowUpdate = new BehaviorSubject<boolean>(false);
  isShowOffStation = new BehaviorSubject<boolean>(false);
  startDateErrorMsg = '';
  endDateErrorMsg = '';
  isLoading$ = false;
  userRes: any;
  userName: any;
  staffId: number;
  isAdmin: any;
  objAdd:any;
  oldId:any;
  columnsToDisplay = [
    "index",
    "fromProvinceName",
    "toProvinceName",
    "vehicleTypeName",
    "price",
    // "ghiChu",
    // "hanhDong"
  ];

  constructor(
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public quanLyPhieuCongTacService: QuanLyPhieuCongTacService,
    public commonService: CommonService,
    public toastrService: ToastrService,
    public spinner: NgxSpinnerService,
    // tslint:disable-next-line:variable-name
    private _liveAnnouncer: LiveAnnouncer,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  ngOnInit(): void {
    this.userRes = JSON.parse(
      localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN)
    );
    this.staffId = this.userRes.staffId;
    this.isAdmin = this.userRes.isAdmin;
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.initDataBox();
    this.loadAddForm();

    const dataEvent = this.quanLyPhieuCongTacService.reloadDetailDataEvent.subscribe(event => {
      this.dataSource = new MatTableDataSource(this.quanLyPhieuCongTacService.cbxLoTrinhCongTac.value);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
    this.subscriptions.push(dataEvent);
    this.objAdd=null;
  }

  updateTable(){
    const requestTarget = {
      functionName: 'detailRouting',
      method: 'POST',
      params: {
        userName: this.userName,
        routingDTO: {
          routingId: this.control('chonLoTrinh').value,
        }
      }
    };
    this.isLoading$ = true;
    const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
      this.isLoading$ = false;
      if (res.errorCode == '0') {
        this.objAdd = {jobRoutingId: this.quanLyPhieuCongTacService.selectedLoTrinhCongTac.id,
          routingId: this.control('chonLoTrinh').value};
        this.dataSource = new MatTableDataSource(res.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.toastService.error(res.description);
      }
    });
    this.subscriptions.push(rq);
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  initDataBox() {

  }

  loadAddForm() {
    this.addForm = this.fb.group({
      chonLoTrinh: ['', [Validators.required]],
      ghiChu: [''],
    });
  }

  checkAdd(){
    if(!this.objAdd){
      return false;
    }
    return true;
  }

  eSave() {
    if (this.objAdd) {
      const modalRef = this.modalService.open(CommonAlertDialogComponent, {
        centered: true,
        backdrop: 'static',
      });
      modalRef.componentInstance.data = {
        type: 'WARNING',
        title: 'COMMON_MODAL.WARNING',
        message: this.translate.instant('CONFIRM.USE_ROUTE'),
        continue: true,
        cancel: true,
        btn: [
          { text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2' },
          { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' },
        ],
      };
      modalRef.result.then(
        (result) => {
          // add
          const requestTarget = {
            functionName: 'addJobRoutingDetail',
            method: 'POST',
            params: {
              userName: this.userName,
              jobRoutingDetailDTO: {
                jobRoutingId: this.objAdd.jobRoutingId,
                routingId: this.objAdd.routingId,
                note: this.objAdd.note
              }
            }
          };
          this.isLoading$ = true;
          const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
            this.isLoading$ = false;
            if (res.errorCode == '0') {
              this.objAdd=null;
              this.toastService.success('Thành công!');
              this.reloadDataEvent.emit();
              // clear form
              this.eResetForm();
            } else {
              this.toastService.error(res.description);
            }
          });
          this.subscriptions.push(rq);
        },
        (reason) => {}
      );
    }else{
      this.toastService.success(this.translate.instant('MESSAGE.ROUTE_NOT_BLANK'));
    }
  }

  eDelete(item) {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static',
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.DELETE_ROUTE_MOVE'),
      continue: true,
      cancel: true,
      btn: [
        { text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2' },
        { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' },
      ],
    };
    modalRef.result.then(
      (result) => {
        const requestTarget = {
          functionName: 'removeJobRoutingDetail',
          method: 'POST',
          params: {
            userName: this.userName,
            jobRoutingDetailDTO: {
              id: item.id
            }
          }
        };
        this.isLoading$ = true;
        const rq = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
          this.isLoading$ = false;
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.DELETE_DATA_SUCCESS'));
            this.reloadDataEvent.emit();
          } else {
            this.toastService.error(res.description);
          }
        });
        this.subscriptions.push(rq);
      },
      (reason) => {}
    );
  }

  eResetForm() {
    this.addForm.reset();
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.addForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.addForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.addForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.addForm.controls[controlName];
    return control.dirty || control.touched;
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.addForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors = this.addForm.get(key).errors;

      if (controlErrors) {
        isValid = false;
      }
    });

    if (this.startDateErrorMsg !== '' || this.endDateErrorMsg !== '') {
      isValid = false;
    }

    return isValid;
  }

  public get toastService() {
    return this.injector.get(ToastrService);
  }

  control(controlName: string): AbstractControl{
    return this.addForm.controls[controlName];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
