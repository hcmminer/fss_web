import { HotelDetailDTO, HotelDTO } from './../../../_models/quan-ly-phieu-cong-tac.model';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ElementRef, Inject, Injector, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
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
import { CommonService } from 'src/app/pages/_services/common.service';
import { QuanLyPhieuCongTacService } from 'src/app/pages/_services/quanLyPhieuCongTac.service';
import { CONFIG } from 'src/app/utils/constants';
import {RequestApiModel} from "../../../_models/request-api.model";
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

interface IHotelDetail {
  listHotelDetailDTO?: IHotelDetail[];
  hotelId?: number | string;
  hotelName?: string;
  telephone?: string;
  provinceId?: number;
  status?: number;
  createdDatetime?: string;
  createdBy?: string;
  lastUpdatedDatetime?: string;
  lastUpdatedBy?: string;
  provinceName?: string;
  id?: number;
  roomType?: string;
  roomTypeName?: string;
  price?: number;
  isEdit: boolean;
  isDelete: boolean;
  isLastObj: boolean;
  isNew: boolean;
}

interface IFlatNode {
  expandable: boolean;
  level: number;
  listHotelDetailDTO?: IHotelDetail[];
  hotelId?: number | string;
  hotelName?: string;
  telephone?: string;
  provinceId?: number;
  status?: number;
  createdDatetime?: string;
  createdBy?: string;
  lastUpdatedDatetime?: string;
  lastUpdatedBy?: string;
  provinceName?: string;
  id?: number;
  roomType?: string;
  roomTypeName?: string;
  price?: number;
  isEdit: boolean;
  isDelete: boolean;
  isLastObj: boolean;
  isNew: boolean;
}



@Component({
  selector: 'app-tab-quan-ly-khach-san',
  templateUrl: './tab-quan-ly-khach-san.component.html',
  styleUrls: ['./tab-quan-ly-khach-san.component.scss']
})
export class TabQuanLyKhachSanComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  searchForm: FormGroup;
  private subscriptions: Subscription[] = [];

  @ViewChild('formSearch') formSearch: ElementRef;
  isShowUpdate = new BehaviorSubject<boolean>(false);
  isShowOffStation = new BehaviorSubject<boolean>(false);
  startDateErrorMsg: string = '';
  endDateErrorMsg: string = '';
  isLoading$: boolean = false;
  userRes: any;
  staffId: number;
  isAdmin: any;
  isViewingDetail: boolean = false;
  selectedPhieuCongTac: any;
  userName: string;
  objectEdit: any;
  isAddNew: any;
  dataList: any;
  dataOld: HotelDTO[];
  displayedColumns: string[] = ['provinceName', 'hotelName', 'telephone', 'roomType', 'price', 'action'];

  constructor(
    public router: Router,
    public translate: TranslateService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public quanLyPhieuCongTacService: QuanLyPhieuCongTacService,
    public commonService: CommonService,
    public toastrService: ToastrService,
    public spinner: NgxSpinnerService,
    private _liveAnnouncer: LiveAnnouncer,
    @Inject(Injector) private readonly injector: Injector
  ) { }

  private transformer = (node: IHotelDetail, level: number) => {
    return {
        expandable: !!node.listHotelDetailDTO && node.listHotelDetailDTO.length > 0,
        level: level,
        hotelId:node.hotelId,
        hotelName: node.hotelName,
        telephone: node.telephone,
        provinceId: node.provinceId,
        status: node.status,
        createdDatetime: node.createdDatetime,
        createdBy: node.createdBy,
        lastUpdatedDatetime: node.lastUpdatedDatetime,
        lastUpdatedBy: node.lastUpdatedBy,
        provinceName: node.provinceName,
        listHotelDetailDTO:node.listHotelDetailDTO,
        id: node.id,
        roomType: node.roomType,
        roomTypeName: node.roomTypeName,
        price: node.price,
        isEdit: node.isEdit,
        isDelete: node.isDelete,
        isLastObj: node.isLastObj,
        isNew: node.isNew
    };
};

treeControl = new FlatTreeControl<IFlatNode>(
    (node) => node.level,
    (node) => node.expandable
);

treeFlattener = new MatTreeFlattener(
    this.transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.listHotelDetailDTO
);
dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);



hasChild = (_: number, node: IFlatNode) => node.expandable;


changeValue(event, data, name) {
  let value = event.target.value;
  if (name == 'province') {
      this.objectEdit['provinceId'] = value;
  } else if (name == 'hotelName') {
      this.objectEdit['hotelName'] = value;
  } else if (name == 'telephone') {
    this.objectEdit['telephone'] = value;
  } else if (name == 'roomType') {
    this.objectEdit.listHotelDetailDTO.forEach(el => {
      if (el.id == data.id) {
        el['roomType'] = value;
      }
  });
  }
  else if (name == 'price') {
    this.objectEdit.listHotelDetailDTO.forEach(el => {
      if (el.id == data.id) {
        el['price'] = value;
      }
    });
  }
}

async eEditRow(data) {
  if (this.objectEdit && this.objectEdit.hotelId != data.hotelId) {
      this.toastService.error(this.translate.instant('MESSAGE.UPDATE_HOTEL_OTHER'));
  } else {
      let ordMax = 0;
      let indexMax = 0;
      let indexRoot = 0;
      await this.treeControl.dataNodes.forEach((element, index) => {
          if (element.hotelId == data.hotelId) {
              element.isEdit = true;
              if (!element.id) {
                  this.objectEdit = element;
                  indexRoot = index;
              }
          }
          element.isLastObj = false;
          element.isDelete = false;
      });
      this.treeControl.dataNodes[indexRoot].isDelete = true;
      this.treeControl.expand(this.treeControl.dataNodes[indexRoot]);
  }
};


eUpdate(data) {
  if (this.validate()) {
      const modalRef = this.modalService.open(CommonAlertDialogComponent, {
          centered: true,
          backdrop: false
      });
      modalRef.componentInstance.data = {
          type: 'WARNING',
          title: 'COMMON_MODAL.WARNING',
          message: this.translate.instant('CONFIRM.UPDATE_INFO_HOTEL'),
          continue: true,
          cancel: true,
          btn: [
              { text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2' },
              { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' }
          ]
      };
      modalRef.result.then(
          result => {
              if (this.objectEdit) {
                  const requestTarget = {
                      functionName: 'editHotel',
                      method: 'POST',
                      params: {
                          userName: this.userName,
                          hotelDTO: this.objectEdit
                      }
                  };
                  const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                      if (res.errorCode == '0') {
                          this.reloadData(data, false, false);
                          this.toastService.success(this.translate.instant('MESSAGE.UPDATE_DATA_SUCCESS'));
                      } else {
                          this.toastService.error(res.description);
                      }
                  });
                  this.subscriptions.push(request);
              } else {
                  this.toastService.error(this.translate.instant('MESSAGE.NOT_FOUND'));
              }
          },
          reason => {
          }
      );
  }
};

eCancel() {
  this.reloadData(null, true, false);
}

async reloadData(data, isDelete, isDeleteDetail) {
  this.objectEdit = null;
  this.isAddNew = false;
  const request = await this.conditionSearch().subscribe(srch => {
      if (srch.errorCode == '0') {
          this.dataSource.data = srch.data;
          this.dataOld = srch.data;
          if (!isDelete) {
              this.treeControl.expand(this.treeControl.dataNodes.filter(e => e.hotelId == data.hotelId && !e.id)[0]);
          }
          if (isDeleteDetail) {
              this.eEditRow(data);
          }
      } else {
          this.toastService.error(srch.description);
      }
  });
  this.subscriptions.push(request);
}
eDeleteDetail(data) {
  if (data.id && data.hotelId) {
      if (data.id > 0) {
          let elements = this.treeControl.dataNodes.filter(el => el.id == data.id && el.hotelId == data.hotelId);
          if (elements && elements.length > 0) {
              let root = this.treeControl.dataNodes.filter(el => !el.id && el.hotelId == data.hotelId);
              if (root && root[0]) {
                  if (root[0].listHotelDetailDTO) {
                    if(root[0].listHotelDetailDTO.filter(el => el.id>0 && el.hotelId == data.hotelId).length>1){
                      const modalRef = this.modalService.open(CommonAlertDialogComponent, {
                          centered: true,
                          backdrop: false
                      });
                      modalRef.componentInstance.data = {
                          type: 'WARNING',
                          title: 'COMMON_MODAL.WARNING',
                          message: this.translate.instant('CONFIRM.DELETE'),
                          continue: true,
                          cancel: true,
                          btn: [
                              { text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2' },
                              { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' }
                          ]
                      };
                      modalRef.result.then(
                          result => {
                              const requestTarget = {
                                  functionName: 'removeHotelDetail',
                                  method: 'POST',
                                  params: {
                                      userName: this.userName,
                                      hotelDetailDTO: {
                                          id: data.id
                                      }
                                  }
                              };
                              const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                                  if (res.errorCode == '0') {
                                      this.reloadData(data, false, true);
                                      this.toastService.success(this.translate.instant('MESSAGE.DELETE_DATA_SUCCESS'));
                                  } else {
                                      this.toastService.error(res.description);
                                  }
                              });
                              this.subscriptions.push(request);
                          },
                          reason => {
                          }
                      );
                    }else{
                      this.toastService.error(this.translate.instant('MESSAGE.NOT_DELETE'));
                    }
                  } else {
                      this.toastService.error(this.translate.instant('MESSAGE.RECORD_NOT_EXIST'));
                  }
              } else {
                  this.toastService.error(this.translate.instant('MESSAGE.NO_EXIST_DETAIL'));
              }
          } else {
              this.toastService.error(this.translate.instant('MESSAGE.ROOM_DETAIL_NO_EXIST'));
          }
      }else{
        if(this.objectEdit.listHotelDetailDTO.length>1){
          let index = this.objectEdit.listHotelDetailDTO.findIndex(e=>e.id==data.id && e.hotelId==data.hotelId);
          this.objectEdit.listHotelDetailDTO.splice(index,1);
          this.dataSource.data.forEach(e => {
              if (e.hotelId == this.objectEdit.hotelId) {
                  e.listHotelDetailDTO = this.objectEdit.listHotelDetailDTO;
              }
          });
          this.dataSource.data = this.dataSource.data;
          this.eEditRow(this.objectEdit);
        }else{
          this.toastService.error(this.translate.instant('MESSAGE.NOT_DELETE'));
        }
      }
  } else {
      let elements = this.treeControl.dataNodes.filter(el => !el.id && el.hotelId == data.hotelId);
      if (elements && elements.length > 0) {
          let element = elements[0];
          if (element.hotelId == data.hotelId && !element.id) {
              const modalRef = this.modalService.open(CommonAlertDialogComponent, {
                  centered: true,
                  backdrop: false
              });
              modalRef.componentInstance.data = {
                  type: 'WARNING',
                  title: 'COMMON_MODAL.WARNING',
                  message: this.translate.instant('CONFIRM.DELETE_HOTEL_MOTEL') + data.hotelName + "?",
                  continue: true,
                  cancel: true,
                  btn: [
                      { text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2' },
                      { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' }
                  ]
              };
              modalRef.result.then(
                  result => {
                      const requestTarget = {
                          functionName: 'removeHotel',
                          method: 'POST',
                          params: {
                              userName: this.userName,
                              hotelDTO: {
                                hotelId: data.hotelId
                              }
                          }
                      };
                      const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                          if (res.errorCode == '0') {
                              this.reloadData(data, true, false);
                              this.toastService.success(this.translate.instant('MESSAGE.DELETE_HOTEL')
                                  + data.hotelName
                                  + this.translate.instant('MESSAGE.SUCCESS'));
                          } else {
                              this.toastService.error(res.description);
                          }
                      });
                      this.subscriptions.push(request);
                  },
                  reason => {
                  }
              );
          } else {
              this.toastService.error(this.translate.instant('MESSAGE.HOTEL_NOT_EXIST'));
          }
      }
  }
};

addNew() {
  if (this.objectEdit) {
      if(this.isAddNew){
          this.toastService.error(this.translate.instant('MESSAGE.ADD_HOTEL_ACTIVE'));
      }else{
       this.toastService.error(this.translate.instant('MESSAGE.UPDATE_HOTEL_ACTIVE'));
      }
  } else {
      let hotel = new HotelDTO();
      hotel.hotelId = -1;
      let hotelDetail = new HotelDetailDTO();
      hotelDetail.id = -1;
      hotelDetail.hotelId = -1;
      hotel.listHotelDetailDTO = [hotelDetail];
      this.dataSource.data = JSON.parse(JSON.stringify([hotel]));
      this.isAddNew = true;
      this.objectEdit = hotel;
      this.eEditRow(hotel);
  }
}

eAddNew() {
  let lastObj = this.objectEdit.listHotelDetailDTO[this.objectEdit.listHotelDetailDTO.length - 1];
  let hotelDetail = new HotelDetailDTO();
  hotelDetail.id = lastObj.id - 1;
  hotelDetail.hotelId = -1;
  this.objectEdit.listHotelDetailDTO.push(hotelDetail);
  this.dataSource.data = JSON.parse(JSON.stringify([this.objectEdit]));
  this.isAddNew = true;
  this.eEditRow(this.objectEdit);
  this.treeControl.expandAll();
}

eEditAddNew() {
  let lastObj = this.objectEdit.listHotelDetailDTO[this.objectEdit.listHotelDetailDTO.length - 1];
  let hotelDetail = new HotelDetailDTO();
  hotelDetail.id = lastObj.id > 0 ? -lastObj.id - 1 : lastObj.id - 1;
  hotelDetail.hotelId = this.objectEdit.hotelId;
  hotelDetail.isNew = true;
  this.objectEdit.listHotelDetailDTO.push(hotelDetail);
  this.dataSource.data.forEach(e => {
      if (e.hotelId == this.objectEdit.hotelId) {
          e.listHotelDetailDTO = this.objectEdit.listHotelDetailDTO;
      }
  });
  this.dataSource.data = this.dataSource.data;
  this.eEditRow(this.objectEdit);
}

eDeleteDetailForAdd(data) {
  if(this.objectEdit.listHotelDetailDTO.length>1){
    let index = this.objectEdit.listHotelDetailDTO.findIndex(e=>e.id==data.id && e.hotelId==data.hotelId);
    this.objectEdit.listHotelDetailDTO.splice(index,1);
    this.dataSource.data.forEach(e => {
        if (e.hotelId == this.objectEdit.hotelId) {
            e.listHotelDetailDTO = this.objectEdit.listHotelDetailDTO;
        }
    });
    this.dataSource.data = this.dataSource.data;
  this.isAddNew = true;
  this.eEditRow(this.objectEdit);
  this.treeControl.expandAll();
  }else{
    this.toastService.error(this.translate.instant('MESSAGE.NOT_DELETE'));
  }
}

validate() {
  if (!this.objectEdit.hotelName) {
      this.toastService.error(this.translate.instant('MESSAGE.HOTEL_NOT_BLANK'));
      return false;
  }
  if (!this.objectEdit.provinceId) {
      this.toastService.error(this.translate.instant('MESSAGE.PROVINCE_NOT_BLANK'));
      return false;
  }
  for (let i = 0; i < this.objectEdit.listHotelDetailDTO.length; i++) {
      let element = this.objectEdit.listHotelDetailDTO[i];
      if (!element.roomType) { this.toastService.error(this.translate.instant('MESSAGE.ROOM_TYPE_NOT_BLANK')); return false; }

      if (!element.price) { this.toastService.error(this.translate.instant('MESSAGE.COST_NOT_BLANK')); return false; }
  };

  //Remove thousand separator of number fields
  this.objectEdit.listHotelDetailDTO.forEach(detail => {
    detail.price = +detail.price.toString().replace(/,/g, '');
  });

  return true;
}

eSave() {
  if (this.validate()) {
      const modalRef = this.modalService.open(CommonAlertDialogComponent, {
          centered: true,
          backdrop: false
      });
      modalRef.componentInstance.data = {
          type: 'WARNING',
          title: 'COMMON_MODAL.WARNING',
          message: this.translate.instant('CONFIRM.ADD_HOTEL_MOTEL') + this.objectEdit.hotelName + '?',
          continue: true,
          cancel: true,
          btn: [
              { text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2' },
              { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' }
          ]
      };
      modalRef.result.then(
          result => {
              const requestTarget = {
                  functionName: 'addHotel',
                  method: 'POST',
                  params: {
                      userName: this.userName,
                      hotelDTO: this.objectEdit
                  }
              };
              const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                  if (res.errorCode == '0') {
                      this.toastService.success(this.translate.instant('MESSAGE.ADD_HOTEL') + this.objectEdit.hotelName + this.translate.instant('MESSAGE.SUCCESS'));
                      this.reloadData(null, true, false);
                  } else {
                      this.toastService.error(res.description);
                  }
              });
              this.subscriptions.push(request);
          },
          reason => {
          }
      );
  }
}
init() {
  let requestProvince = {
      functionName: 'getCbProvince',
      method: 'POST',
      params: {
        userName: this.userName,
      }
    }
    this.quanLyPhieuCongTacService.getListProvinceBox(requestProvince, true);

    let requestRoomType = {
      functionName: 'getCbOptionSet',
      method: 'POST',
      params: {
        userName: this.userName,
        optionSetDTO: {
          optionSetCode: 'ROOM_TYPE'
        }
      }
    }
    this.quanLyPhieuCongTacService.getListRoomTypeBox(requestRoomType, true);
}

  ngOnInit(): void {
    this.userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
    this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
    this.staffId = this.userRes.staffId;
    this.isAdmin = this.userRes.isAdmin;
    this.init();
    // this.initDataBox();
    // this.loadSearchForm();
    // const dataEvent = this.quanLyPhieuCongTacService.reloadDetailDataEvent.subscribe(event => {
    //   this.dataSource = new MatTableDataSource(this.quanLyPhieuCongTacService.cbxKhachSanCongTac.value);
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
    // });
    // this.subscriptions.push(dataEvent);


    this.eSearch();
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
    if(filterValue){
        let search = this.dataOld.filter(e=>((e.provinceName?e.provinceName:"")+"-"+(e.hotelName?e.hotelName:"")+"-"+(e.telephone?e.telephone:"")).toLocaleLowerCase().includes(filterValue.toLocaleLowerCase()));
        this.dataSource.data=Object.assign([],search);
    }else{
        this.dataSource.data=Object.assign([],this.dataOld);
    }
}

  initDataBox() {
    this.quanLyPhieuCongTacService.cbxLoaiPhong.value.unshift({
      value: '',
      name: this.translate.instant('DEFAULT_OPTION.SELECT'),
    });
  }

  loadSearchForm() {
    this.searchForm = this.fb.group({
      tinh: ['', []],
      tenKhachSan: ['', []],
      soDienThoai: ['', []],
    });
  }
  eSearch() {
    this.isLoading$ = true;
    const request = this.conditionSearch().subscribe(res => {
      this.isLoading$ = false;
      if (res.errorCode == '0') {
        this.isAddNew=false;
        this.objectEdit=null;
        this.dataSource.data = res.data;
        this.dataOld = res.data;
      } else {
        this.toastService.error(res.description);
      }
    });
    this.subscriptions.push(request);
  }
  
  conditionSearch() {
    const requestTarget = {
      functionName: 'searchHotel',
      method: 'POST',
      params: {
        userName: this.userName,
      }
    };
    return this.commonService.callAPICommon(requestTarget as RequestApiModel);
  }

  eDelete(item) {
    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.data = {
      type: 'WARNING',
      title: 'COMMON_MODAL.WARNING',
      message: this.translate.instant('CONFIRM.DELETE_HOTEL'),
      continue: true,
      cancel: true,
      btn: [
        {text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2'},
        {text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2'}
      ]
    };
    modalRef.result.then(
      result => {
        const requestTarget = {
          functionName: 'removeHotel',
          method: 'POST',
          params: {
            userName: this.userName,
            hotelDTO: {
              hotelId: item
            }
          }
        };
        const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
          if (res.errorCode == '0') {
            this.toastService.success(this.translate.instant('MESSAGE.DELETE_HOTEL_SUCCESS'));
            this.eSearch();
          } else {
            this.toastService.error(res.description);
          }
        });
        this.subscriptions.push(request);
      },
      reason => {
      }
    );
  }

  eResetForm() {
    this.searchForm.reset();
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.searchForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.searchForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.searchForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.searchForm.controls[controlName];
    return control.dirty || control.touched;
  }

  isValidForm(): boolean {
    let isValid = true;
    Object.keys(this.searchForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors =
        this.searchForm.get(key).errors;

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

  control(controlName: string) {
    return this.searchForm.controls[controlName];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }
}
