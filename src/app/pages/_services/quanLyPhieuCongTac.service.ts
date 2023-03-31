import {
  BusinessFeeDTO,
  HotelDTO,
  JobAttachDTO,
  JobHotelDTO,
  JobOtherDTO,
  JobRequestDTO,
  JobRoutingDetailDTO,
  JobRoutingDTO,
  JobStaffDTO,
  OptionSetDTO,
  ProvinceDTO,
  RoutingDTO,
  RoutingPriceDTO,
  ShopDTO,
  StaffDTO,
} from './../_models/quan-ly-phieu-cong-tac.model';
import { CommonService } from './common.service';
import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { HTTPService } from './http.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { PaginatorState } from '../../_metronic/shared/crud-table';
import { catchError, finalize, map } from 'rxjs/operators';
import { ResponseModel } from '../_models/response.model';
import { RequestApiModel } from '../_models/request-api.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { FileSaver } from 'src/app/utils/file-saver';
import { CONFIG } from 'src/app/utils/constants';

@Injectable({
  providedIn: 'root',
})
export class QuanLyPhieuCongTacService implements OnDestroy {
    reloadDetailDataEvent = new EventEmitter<any>();
    changeHotelEvent = new EventEmitter<any>();
    subscriptions: Subscription[] = [];
    paginatorState = new BehaviorSubject<PaginatorState>(new PaginatorState());
    listSearchResults = new BehaviorSubject<any[]>([]);
    listRoutingDTO = new BehaviorSubject<RoutingDTO[]>([]);
    listHotelDTO = new BehaviorSubject<HotelDTO[]>([]);
    listBusinessFee = new BehaviorSubject<BusinessFeeDTO[]>([]);
    cbxMucDichCongTac = new BehaviorSubject<OptionSetDTO[]>([]);
    cbxNhanVienNoiBo = new BehaviorSubject<StaffDTO[]>([]);
    cbxNhanVienNoiBoTrinhKy = new BehaviorSubject<StaffDTO[]>([]);
    cbxNhanVienCongTac = new BehaviorSubject<JobStaffDTO[]>([]);
    cbxDonViNoiBo = new BehaviorSubject<ShopDTO[]>([]);
    cbxDonViNoiBoDi = new BehaviorSubject<ShopDTO[]>([]);
    cbxDonViNoiBoDen = new BehaviorSubject<ShopDTO[]>([]);
  cbxTinh = new BehaviorSubject<ProvinceDTO[]>([]); // lấy các tỉnh
  cbxShopName = new BehaviorSubject<any[]>([]); // lấy tên đơn vị
    cbxKhachSan = new BehaviorSubject<HotelDTO[]>([]);
    cbxLoaiPhong = new BehaviorSubject<OptionSetDTO[]>([]);
    cbxKhachSanCongTac = new BehaviorSubject<JobHotelDTO[]>([]);
    cbxLoTrinh = new BehaviorSubject<RoutingDTO[]>([]);
    cbxLoTrinhCongTac = new BehaviorSubject<JobRoutingDetailDTO[]>([]);
    cbxPhuongTien = new BehaviorSubject<OptionSetDTO[]>([]);
    cbxChucDanh = new BehaviorSubject<OptionSetDTO[]>([]);
    cbxChiPhi = new BehaviorSubject<OptionSetDTO[]>([]);
    cbxChiPhiKhacCongTac = new BehaviorSubject<JobOtherDTO[]>([]);
    cbxLoaiFile = new BehaviorSubject<OptionSetDTO[]>([]);
    cbxTrangThaiKyVO = new BehaviorSubject<OptionSetDTO[]>([]);
    cbxTrangThaiJob = new BehaviorSubject<OptionSetDTO[]>([]);
    cbxFileDinhKemCongTac = new BehaviorSubject<JobAttachDTO[]>([]);
    file = new BehaviorSubject<any>(null);
    listDinhMucDiChuyen = new BehaviorSubject<RoutingPriceDTO[]>([]);
    selectedPhieuCongTac: JobRequestDTO;
    selectedLoTrinhCongTac: JobRoutingDTO;
    finishJobRequest: JobRequestDTO;
    listFinishJobRouting = new BehaviorSubject<JobRoutingDTO[]>([]);
    selectedRoutingId: any;
    selectedHotelId: any;
    initHeader: {};
    header = {
        'Content-Type': 'application/json',
  };
  constructor(
    private httpService: HTTPService,
    private toastrService: ToastrService,
    public translateService: TranslateService,
    private commonService: CommonService,
    public spinner: NgxSpinnerService,
    private httpClient: HttpClient,
  ) {
    const token = localStorage.getItem(CONFIG.KEY.TOKEN);
    const language = localStorage.getItem(CONFIG.KEY.LOCALIZATION);
    this.initHeader = {
      Authorization: `Bearer ${token}`,
      'Accept-Language': language,
      ...this.header,
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  getListPurposeBox(query: RequestApiModel, allowDefault: boolean): void {
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != '0') {
            this.cbxMucDichCongTac.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxMucDichCongTac.next(response.data as OptionSetDTO[]);
          } else {
            this.cbxMucDichCongTac.next([]);
          }
          if (allowDefault)
            this.cbxMucDichCongTac.value.unshift({
              value: '',
              name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getListStaffBox(query: RequestApiModel, allowDefault: boolean): Observable<any> {
    query.isNotShowSpinner = true;
    return this.commonService.callAPICommon(query).pipe(
      map((response: ResponseModel) => {
        //Combobox nhan vien noi bo
        if (query.params.isSignVOStaff) {
          if (response.errorCode != '0') {
            this.cbxNhanVienNoiBoTrinhKy.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxNhanVienNoiBoTrinhKy.next(response.data as StaffDTO[]);
          } else {
            this.cbxNhanVienNoiBoTrinhKy.next([]);
          }
          if (allowDefault)
            this.cbxNhanVienNoiBoTrinhKy.value.unshift({
              email: '',
              shopStaffEmail: '',
            });
        } else {
          if (response.errorCode != '0') {
            this.cbxNhanVienNoiBo.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxNhanVienNoiBo.next(response.data as StaffDTO[]);
          } else {
            this.cbxNhanVienNoiBo.next([]);
          }
          if (allowDefault)
            this.cbxNhanVienNoiBo.value.unshift({
              staffId: '',
              staffName: '',
            });
        }
      }),
      catchError((err) => {
        this.toastrService.error(err.error?.message || err.message, 'Error');
        return of(undefined);
      }),
      finalize(() => {}),
    );
  }

  getListShopBox(query: RequestApiModel, allowDefault: boolean): Observable<any> {
    query.isNotShowSpinner = true;
    return this.commonService.callAPICommon(query).pipe(
      map((response: ResponseModel) => {
        //Combobox don vi noi bo
        if (!query.params.shopState) {
          if (response.errorCode != '0') {
            this.cbxDonViNoiBo.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxDonViNoiBo.next(response.data as ShopDTO[]);
          } else {
            this.cbxDonViNoiBo.next([]);
          }
          if (allowDefault)
            this.cbxDonViNoiBo.value.unshift({
              shopId: '',
              shopName: '',
            });
        } else if (query.params.shopState == 'from') {
          if (response.errorCode != '0') {
            this.cbxDonViNoiBoDi.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxDonViNoiBoDi.next(response.data as ShopDTO[]);
          } else {
            this.cbxDonViNoiBoDi.next([]);
          }
          if (allowDefault)
            this.cbxDonViNoiBoDi.value.unshift({
              shopId: '',
              shopName: '',
            });
        } else if (query.params.shopState == 'to') {
          if (response.errorCode != '0') {
            this.cbxDonViNoiBoDen.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxDonViNoiBoDen.next(response.data as ShopDTO[]);
          } else {
            this.cbxDonViNoiBoDen.next([]);
          }
          if (allowDefault)
            this.cbxDonViNoiBoDen.value.unshift({
              shopId: '',
              shopName: '',
            });
        }
      }),
      catchError((err) => {
        this.toastrService.error(err.error?.message || err.message, 'Error');
        return of(undefined);
      }),
      finalize(() => {}),
    );
  }

  getListProvinceBox(query: RequestApiModel, allowDefault: boolean): void {
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != '0') {
            this.cbxTinh.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxTinh.next(response.data as ProvinceDTO[]);
          } else {
            this.cbxTinh.next([]);
          }
          if (allowDefault)
            this.cbxTinh.value.unshift({
              provinceId: '',
              provinceName: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getListVehicleBox(query: RequestApiModel, allowDefault: boolean): void {
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != '0') {
            this.cbxPhuongTien.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxPhuongTien.next(response.data as OptionSetDTO[]);
          } else {
            this.cbxPhuongTien.next([]);
          }
          if (allowDefault)
            this.cbxPhuongTien.value.unshift({
              value: '',
              name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getListPositionBox(query: RequestApiModel, allowDefault: boolean): void {
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != '0') {
            this.cbxChucDanh.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxChucDanh.next(response.data as OptionSetDTO[]);
          } else {
            this.cbxChucDanh.next([]);
          }
          if (allowDefault)
            this.cbxChucDanh.value.unshift({
              value: '',
              name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getListRoutingBox(query: RequestApiModel, allowDefault: boolean): void {
    query.isNotShowSpinner = true;
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != '0') {
            this.cbxLoTrinh.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxLoTrinh.next(response.data as RoutingDTO[]);
          } else {
            this.cbxLoTrinh.next([]);
          }
          if (allowDefault)
            this.cbxLoTrinh.value.unshift({
              routingId: '',
              name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getListHotelBox(query: RequestApiModel, allowDefault: boolean): void {
    query.isNotShowSpinner = true;
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != '0') {
            this.cbxKhachSan.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxKhachSan.next(response.data as HotelDTO[]);
          } else {
            this.cbxKhachSan.next([]);
          }
          if (allowDefault)
            this.cbxKhachSan.value.unshift({
              hotelId: '',
              hotelName: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getListRoomTypeBox(query: RequestApiModel, allowDefault: boolean): void {
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != '0') {
            this.cbxLoaiPhong.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxLoaiPhong.next(response.data as OptionSetDTO[]);
          } else {
            this.cbxLoaiPhong.next([]);
          }
          if (allowDefault)
            this.cbxLoaiPhong.value.unshift({
              value: '',
              name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getListFileTypeBox(query: RequestApiModel, allowDefault: boolean): void {
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != '0') {
            this.cbxLoaiFile.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxLoaiFile.next(response.data as OptionSetDTO[]);
          } else {
            this.cbxLoaiFile.next([]);
          }
          if (allowDefault)
            this.cbxLoaiFile.value.unshift({
              value: '',
              name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getListSignVOStatusBox(query: RequestApiModel, allowDefault: boolean): void {
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != '0') {
            this.cbxTrangThaiKyVO.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            let rsList: OptionSetDTO[] = response.data;
            rsList.unshift({
              value: '-1',
              name: this.translateService.instant('LABEL.NOT_YET_SIGNED'),
            });
            //bo trang thai ko can hien thi len cbx
            rsList = rsList.filter((item) => item.value != '0' && item.value != '2');
            this.cbxTrangThaiKyVO.next(rsList as OptionSetDTO[]);
          } else {
            this.cbxTrangThaiKyVO.next([]);
          }
          if (allowDefault)
            this.cbxTrangThaiKyVO.value.unshift({
              value: '',
              name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  getListOtherFeeBox(query: RequestApiModel, allowDefault: boolean): void {
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != '0') {
            this.cbxChiPhi.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxChiPhi.next(response.data as OptionSetDTO[]);
          } else {
            this.cbxChiPhi.next([]);
          }
          if (allowDefault)
            this.cbxChiPhi.value.unshift({
              value: '',
              name: this.translateService.instant('DEFAULT_OPTION.SELECT'),
            });
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {}),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

    getListJobStatusBox(query: RequestApiModel, allowDefault: boolean): void {
        
        const request = this.commonService
            .callAPICommon(query)
            .pipe(
                map((response: ResponseModel) => {
                    if (response.errorCode != "0") {
                        this.cbxTrangThaiJob.next([]);
                        throw new Error(response.description);
                    }
                    if (typeof response.data !== "undefined" && response.data !== null) {
                        let rsList: OptionSetDTO[] = response.data;
                        //bo trang thai ko can hien thi len cbx
                        rsList = rsList.filter(item => item.value == '2' || item.value == '4');
                        this.cbxTrangThaiJob.next(rsList as OptionSetDTO[]);
                    } else {
                        this.cbxTrangThaiJob.next([]);
                    }
                    if (allowDefault)
                        this.cbxTrangThaiJob.value.unshift({
                            value: '',
                            name: this.translateService.instant("DEFAULT_OPTION.SELECT"),
                        });
                }),
                catchError((err) => {
                    this.toastrService.error(err.error?.message || err.message, "Error");
                    return of(undefined);
                }),
                finalize(() => {
                })
            )
            .subscribe();
        this.subscriptions.push(request);
    }

  getListDetailJobRoutingData(query: RequestApiModel): void {
    const request = this.commonService
      .callAPICommon(query)
      .pipe(
        map((response: ResponseModel) => {
          if (response.errorCode != '0') {
            this.cbxLoTrinhCongTac.next([]);
            this.cbxNhanVienCongTac.next([]);
            this.cbxKhachSanCongTac.next([]);
            this.cbxChiPhiKhacCongTac.next([]);
            this.cbxFileDinhKemCongTac.next([]);
            throw new Error(response.description);
          }
          if (typeof response.data !== 'undefined' && response.data !== null) {
            this.cbxLoTrinhCongTac.next(response.data.listJobRoutingDetailDTO as JobRoutingDetailDTO[]);
            this.cbxNhanVienCongTac.next(response.data.listJobStaffDTO as JobStaffDTO[]);
            this.cbxKhachSanCongTac.next(response.data.listJobHotelDTO as JobHotelDTO[]);
            this.cbxChiPhiKhacCongTac.next(response.data.listJobOtherDTO as JobOtherDTO[]);
            this.cbxFileDinhKemCongTac.next(response.data.listJobAttachDTO as JobAttachDTO[]);
          } else {
            this.cbxLoTrinhCongTac.next([]);
            this.cbxNhanVienCongTac.next([]);
            this.cbxKhachSanCongTac.next([]);
            this.cbxChiPhiKhacCongTac.next([]);
            this.cbxFileDinhKemCongTac.next([]);
          }
        }),
        catchError((err) => {
          this.toastrService.error(err.error?.message || err.message, 'Error');
          return of(undefined);
        }),
        finalize(() => {
          this.reloadJobDetailData();
        }),
      )
      .subscribe();
    this.subscriptions.push(request);
  }

  reloadJobDetailData() {
    this.reloadDetailDataEvent.emit();
  }

  getShowFinishJobData(query: RequestApiModel) {
    return this.commonService.callAPICommon(query).pipe(
      map((response: ResponseModel) => {
        if (response.errorCode != '0') {
          this.finishJobRequest = null;
          this.listFinishJobRouting.next([]);
          throw new Error(response.description);
        }
        if (typeof response.data !== 'undefined' && response.data !== null) {
          this.finishJobRequest = response.data[0] as JobRequestDTO;
          this.listFinishJobRouting.next(this.finishJobRequest.listJobRoutingDTO as JobRoutingDTO[]);
        } else {
          this.finishJobRequest = null;
          this.listFinishJobRouting.next([]);
        }
      }),
      catchError((err) => {
        this.toastrService.error(err.error?.message || err.message, 'Error');
        return of(undefined);
      }),
      finalize(() => {}),
    );
  }

  changeHotel(khachSanId) {
    this.changeHotelEvent.emit(khachSanId);
  }

  getFile(query: RequestApiModel): any {
    return this.commonService.callAPICommon(query).pipe(
      map((response: any) => {
        if (response.errorCode != '0') {
          this.file.next('data:text/plain;base64,');
          if (response.message) {
            throw new Error(response.message);
          } else {
            throw new Error(this.translateService.instant('MANAGE_GNETTRACK.ERROR_GET_FILE'));
          }
        }
        if (typeof response.data.fileContent !== 'undefined' && response.data.fileContent !== null && response.data.fileContent.length > 0) {
          this.file.next(response.data.fileContent);
        }
      }),
      catchError((err) => {
        this.toastrService.error(err.error?.message || err.message, 'Error');
        return of(undefined);
      }),
      finalize(() => {}),
    );
  }

  public downloadTemplate(): any {
    // @ts-ignore
    return this.httpClient.get(`./assets/IMPORT_ROUTING_PRICE_TMP.xlsx`, { responseType: 'blob' });
  }

  // exportReport(params: any, reportTypePath: string): Observable<any> {
  //
  //     this.spinner.show();
  //     const url = `${environment.apiUrl}${reportTypePath}`;

  //     return this.httpClient
  //         .get(url, {
  //             headers: new HttpHeaders(this.initHeader),
  //             responseType: "blob",
  //             observe: "response",
  //             params: params,
  //         })
  //         .pipe(
  //             catchError((err) => {
  //                 this.spinner.hide();
  //                 this.toastrService.error(err.error?.message || err.message, "Error");
  //                 return of({id: undefined});
  //             }),
  //             finalize(() => {
  //
  //                 this.spinner.hide();
  //             })
  //         );
  // }

  saveFile(name, mimeType, data) {
    const fileSaver: any = new FileSaver();
    fileSaver.responseData = data.body;
    fileSaver.strFileName = name;
    fileSaver.strMimeType = mimeType;
    fileSaver.initSaveFile();
  }

  // uploadFileToUpdate(
  //     formData: FormData,
  //     params: any
  // ): Observable<ResponseModel> {
  //     return this.httpClient.post<ResponseModel>(
  //         `${environment.apiUrl}/uploadFileToUpdate`,
  //         formData,
  //         {
  //             params: params,
  //             headers: {
  //                 "Accept-Language": localStorage.getItem(CONFIG.KEY.LOCALIZATION),
  //                 Authorization: "Bearer " + localStorage.getItem(CONFIG.KEY.TOKEN),
  //             },
  //         }
  //     );
  // }
}
