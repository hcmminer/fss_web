import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ElementRef, Inject, Injector, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
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
import { RequestApiModel } from '../../../_models/request-api.model';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
    MatTreeFlatDataSource,
    MatTreeFlattener,
} from '@angular/material/tree';
import { RoutingDetailDTO, RoutingDTO } from 'src/app/pages/_models/quan-ly-phieu-cong-tac.model';
import * as $ from 'jquery';

interface IRoutingDetail {
    id?: number;
    routingId?: number;
    fromProvinceId?: number;
    toProvinceId?: number;
    vehicleType?: number;
    price?: number;
    fromProvinceName: string;
    toProvinceName: string;
    vehicleTypeName: string;
    listRoutingDetailDTO?: IRoutingDetail[];
    note: string;
    startProvinceName: string;
    endProvinceName: string;
    totalAmount?: number;
    startProvinceId?: number;
    endProvinceId?: number;
    name: string;
    ord: number;
    isEdit: boolean;
    isDelete: boolean;
    isLastObj: boolean;
    isNew: boolean;
    hasChild:boolean;
}

interface IFlatNode {
    expandable: boolean;
    level: number;
    id?: number;
    routingId?: number;
    fromProvinceId?: number;
    toProvinceId?: number;
    vehicleType?: number;
    price?: number;
    fromProvinceName: string;
    toProvinceName: string;
    vehicleTypeName: string;
    note: string;
    startProvinceName: string;
    endProvinceName: string;
    totalAmount?: number;
    startProvinceId?: number;
    endProvinceId?: number;
    name: string;
    ord: number;
    listRoutingDetailDTO?: IRoutingDetail[];
    isEdit: boolean;
    isDelete: boolean;
    isLastObj: boolean;
    isNew: boolean;
    hasChild:boolean;
}
@Component({
    selector: 'app-tab-quan-ly-lo-trinh',
    templateUrl: './tab-quan-ly-lo-trinh.component.html',
    styleUrls: ['./tab-quan-ly-lo-trinh.component.scss']
})
export class TabQuanLyLoTrinhComponent implements OnInit, OnDestroy {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    searchForm: FormGroup;
    private subscriptions: Subscription[] = [];

    @ViewChild('formSearch') formSearch: ElementRef;
    isShowUpdate = new BehaviorSubject<boolean>(false);
    isShowOffStation = new BehaviorSubject<boolean>(false);
    startDateErrorMsg = '';
    endDateErrorMsg = '';
    isLoading$ = false;
    userRes: any;
    staffId: number;
    isAdmin: any;
    userName: string;
    isViewingDetail = false;
    selectedPhieuCongTac: any;
    objectEdit: any;
    isAddNew: any;
    dataList: any;
    dataOld: RoutingDTO[];
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
    ) {
    }
    displayedColumns: string[] = ['name', 'fromProvince', 'toProvince', 'note', 'vehicleName', 'price', 'totalAmount', 'action'];

    private transformer = (node: IRoutingDetail, level: number) => {
        return {
            expandable: !!node.listRoutingDetailDTO && node.listRoutingDetailDTO.length > 0,
            level: level,
            routingId: node.routingId,
            id: node.id,
            fromProvinceId: node.fromProvinceId,
            toProvinceId: node.toProvinceId,
            vehicleType: node.vehicleType,
            price: node.price,
            fromProvinceName: node.fromProvinceName,
            toProvinceName: node.toProvinceName,
            vehicleTypeName: node.vehicleTypeName,
            note: node.note,
            startProvinceName: node.startProvinceName,
            endProvinceName: node.endProvinceName,
            totalAmount: node.totalAmount,
            startProvinceId: node.startProvinceId,
            endProvinceId: node.endProvinceId,
            name: node.name,
            listRoutingDetailDTO: node.listRoutingDetailDTO,
            ord: node.ord,
            isEdit: node.isEdit,
            isDelete: node.isDelete,
            isLastObj: node.isLastObj,
            isNew: node.isNew,
            hasChild:node.hasChild
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
        (node) => node.listRoutingDetailDTO
    );
    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);



    hasChild = (_: number, node: IFlatNode) => node.expandable;


    async eEditRow(data) {
        if (this.objectEdit && this.objectEdit.routingId != data.routingId) {
            this.toastService.error(this.translate.instant('MESSAGE.UPDATE_ROUTE_ACTIVE'));
        } else {
            let ordMax = 0;
            let indexMax = 0;
            let indexRoot = 0;
            await this.treeControl.dataNodes.forEach((element, index) => {
                if (element.routingId == data.routingId) {
                    element.isEdit = true;
                    if (!element.id) {
                        //--start fix bug re-select end province
                        let currentEndProvinceId = this.objectEdit ? this.objectEdit['endProvinceId'] : null;
                        let currentEndProvinceName = this.objectEdit ? this.objectEdit['endProvinceName'] : null;
                        this.objectEdit = element;  //this row had before fix bug
                        if (currentEndProvinceId && currentEndProvinceName) {
                            this.objectEdit['endProvinceId'] = currentEndProvinceId;
                            this.objectEdit['endProvinceName'] = currentEndProvinceName;
                        }
                        //--end fix bug

                        indexRoot = index;
                        if(element.listRoutingDetailDTO && element.listRoutingDetailDTO.length>1){
                            element.hasChild=true;
                        }else{
                            element.hasChild=false;
                        }
                    }
                    if (element.ord && element.ord >= ordMax) {
                        ordMax = element.ord;
                        indexMax = index;
                    }
                }
                element.isLastObj = false;
                element.isDelete = false;
            });
            this.treeControl.dataNodes[indexRoot].isDelete = true;
            if (this.treeControl.dataNodes[indexRoot].listRoutingDetailDTO && this.treeControl.dataNodes[indexRoot].listRoutingDetailDTO.length > 1) {
                this.treeControl.dataNodes[indexMax].isDelete = true;
            }
            if (this.treeControl.dataNodes[indexRoot].listRoutingDetailDTO && this.treeControl.dataNodes[indexRoot].listRoutingDetailDTO.length == 1 && !this.isAddNew) {
                this.treeControl.dataNodes[indexMax].isLastObj = true;
            }
            this.treeControl.expand(this.treeControl.dataNodes[indexRoot]);
        }
    };

    changeValue(event, data, name, self) {
        let value = event.target.value;
        if (name == 'endProvince') {
            this.objectEdit['endProvinceId'] = value;
            this.objectEdit['endProvinceName'] = event.target.selectedOptions[0].label;
            if(this.objectEdit.listRoutingDetailDTO && this.objectEdit.listRoutingDetailDTO>1){
                let oldData=this.dataOld.filter(e=>e.routingId==data.routingId)[0];
                this.objectEdit['endProvinceId'] = oldData.endProvinceId;
                this.objectEdit['endProvinceName'] = oldData.endProvinceName;
                let indexInRoot= this.treeControl.dataNodes.findIndex(e=>e.routingId==data.routingId && !e.id);
                this.treeControl.dataNodes[indexInRoot]['endProvinceId']= oldData.endProvinceId;
                this.treeControl.dataNodes[indexInRoot]['endProvinceName']= oldData.endProvinceName;
            }
        } else if (name == 'toProvince') {
            this.objectEdit.listRoutingDetailDTO.forEach((el,index) => {
                if (el.id == data.id) {
                    el['toProvinceId'] = value;
                    el['toProvinceName'] = event.target.selectedOptions[0].label;
                    if(index+1>=0 && this.objectEdit.listRoutingDetailDTO[index+1]){
                        this.objectEdit.listRoutingDetailDTO[index+1]['fromProvinceId']=value;
                       let indexInRoot= this.treeControl.dataNodes.findIndex(e=>e.routingId==data.routingId && e.id==data.id);
                       this.treeControl.dataNodes[indexInRoot+1]['fromProvinceId']= value;
                    }
                }
            });
            this.objectEdit.listRoutingDetailDTO.forEach(el => {
                if (el.id == data.id) {
                    let fromProvinceId = el['fromProvinceId'] == "" ? -1 : el['fromProvinceId'];
                    let toProvinceId = el['toProvinceId'] == "" ? -1 : el['toProvinceId'];
                    let vehicleType = el['vehicleType'] == "" ? -1 : el['vehicleType'];
                    if (el['fromProvinceId'] && el['toProvinceId'] && el['vehicleType']) {
                        this.reloadRoutingPrice(fromProvinceId, toProvinceId, vehicleType).subscribe((res) => {
                            if (res.errorCode == "0") {
                                if (res.data && res.data.length > 0) {
                                    let newPrice = res.data[0].price;
                                    el['price'] = newPrice;
                                    data.price = newPrice;
                                }else{
                                    el['price'] = '';
                                    data.price = '';
                                }
                            }else{
                                el['price'] = '';
                                data.price = '';
                            }
                        });
                    }
                }
            });
        } else if (name == 'vehicleType') {
            this.objectEdit.listRoutingDetailDTO.forEach(el => {
                if (el.id == data.id) {
                    el['vehicleType'] = value;
                }
            });
            this.objectEdit.listRoutingDetailDTO.forEach(el => {
                if (el.id == data.id) {
                    let fromProvinceId = el['fromProvinceId'] == "" ? -1 : el['fromProvinceId'];
                    let toProvinceId = el['toProvinceId'] == "" ? -1 : el['toProvinceId'];
                    let vehicleType = el['vehicleType'] == "" ? -1 : el['vehicleType'];
                    if (el['fromProvinceId'] && el['toProvinceId'] && el['vehicleType']) {
                        this.reloadRoutingPrice(fromProvinceId, toProvinceId, vehicleType).subscribe((res) => {
                            if (res.errorCode == "0") {
                                if (res.data && res.data.length > 0) {
                                    let newPrice = res.data[0].price;
                                    el['price'] = newPrice;
                                    data.price = newPrice;
                                }else{
                                    el['price'] = '';
                                    data.price = '';
                                }
                            }else{
                                el['price'] = '';
                                data.price = '';
                            }
                        });
                    }
                }
            });
        } else if (name == 'startProvince') {
            this.objectEdit['startProvinceId'] = value;
            if(this.objectEdit.listRoutingDetailDTO){
                this.objectEdit.listRoutingDetailDTO[0]['fromProvinceId']=value;
               let indexInRoot= this.treeControl.dataNodes.findIndex(e=>e.routingId==data.routingId && !e.id);
               this.treeControl.dataNodes[indexInRoot+1]['fromProvinceId']= value;
            }
            if(this.objectEdit.listRoutingDetailDTO && this.objectEdit.listRoutingDetailDTO>1){
                let oldData=this.dataOld.filter(e=>e.routingId==data.routingId)[0];
                this.objectEdit['startProvinceId'] = oldData.startProvinceId;
                let indexInRoot= this.treeControl.dataNodes.findIndex(e=>e.routingId==data.routingId && !e.id);
                this.treeControl.dataNodes[indexInRoot]['startProvinceId']= oldData.startProvinceId;
            }
        } else if (name == 'fromProvince') {
            this.objectEdit.listRoutingDetailDTO.forEach((el,index) => {
                if (el.id == data.id) {
                    if(index-1>=0){
                        el['fromProvinceId'] = this.objectEdit.listRoutingDetailDTO[index-1].toProvinceId;
                        $('#'+self).val(this.objectEdit.listRoutingDetailDTO[index-1].toProvinceId);
                    }else{
                        let indexInRoot= this.treeControl.dataNodes.findIndex(e=>e.routingId==data.routingId && !e.id);
                        if(this.treeControl.dataNodes[indexInRoot].startProvinceId){
                            $('#'+self).val(this.treeControl.dataNodes[indexInRoot].startProvinceId);
                            el['fromProvinceId'] = this.treeControl.dataNodes[indexInRoot].startProvinceId;
                        }else{
                            el['fromProvinceId'] = value;
                        }
                    }
                }
            });
            this.objectEdit.listRoutingDetailDTO.forEach(el => {
                if (el.id == data.id) {
                    let fromProvinceId = el['fromProvinceId'] == "" ? -1 : el['fromProvinceId'];
                    let toProvinceId = el['toProvinceId'] == "" ? -1 : el['toProvinceId'];
                    let vehicleType = el['vehicleType'] == "" ? -1 : el['vehicleType'];
                    if (el['fromProvinceId'] && el['toProvinceId'] && el['vehicleType']) {
                        this.reloadRoutingPrice(fromProvinceId, toProvinceId, vehicleType).subscribe((res) => {
                            if (res.errorCode == "0") {
                                if (res.data && res.data.length > 0) {
                                    let newPrice = res.data[0].price;
                                    el['price'] = newPrice;
                                    data.price = newPrice;
                                }else{
                                    el['price'] = '';
                                    data.price = '';
                                }
                            }else{
                                el['price'] = '';
                                data.price = '';
                            }
                        });
                    }
                }
            });
        } else if (name == 'name') {
            this.objectEdit['name'] = value;
        }
        else if (name == 'note') {
            this.objectEdit['note'] = value;
        } 
        else if (name == 'price') {
            this.objectEdit.listRoutingDetailDTO.forEach(el => {
                if (el.id == data.id) {
                    el['price'] = value;
                    data.price = value;
                }
            });
        }

    }

    getListVehicle() {
        let requestVehicle = {
            functionName: 'getCbOptionSet',
            method: 'POST',
            params: {
                userName: this.userName,
                optionSetDTO: {
                    optionSetCode: 'VEHICLE_TYPE'
                }
            }
        };
        this.quanLyPhieuCongTacService.getListVehicleBox(requestVehicle, true);
    }
    reloadRoutingPrice(fromProvinceId, toProvinceId, vehicleType) {
        const requestTarget = {
            functionName: "searchRoutingPrice",
            method: "POST",
            params: {
                routingPriceDTO: {
                    fromProvinceId: fromProvinceId,
                    toProvinceId: toProvinceId,
                    vehicleType: vehicleType,
                },
            },
        };
        return this.commonService.callAPICommon(requestTarget as RequestApiModel);
    }
    eUpdate(data) {
        if (this.validate()) {
            const modalRef = this.modalService.open(CommonAlertDialogComponent, {
                centered: true,
                backdrop: false
            });
            modalRef.componentInstance.data = {
                type: 'WARNING',
                title: 'COMMON_MODAL.WARNING',
                message: this.translate.instant('CONFIRM.UPDATE_INFO_ROUTE'),
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
                            functionName: 'editRouting',
                            method: 'POST',
                            params: {
                                userName: this.userName,
                                routingDTO: this.objectEdit
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

    async reloadData(data, isDeleteRouting, isDeleteDetail) {
        this.objectEdit = null;
        this.isAddNew = false;
        await this.conditionSearch().subscribe(srch => {
            if (srch.errorCode == '0') {
                this.dataSource.data = srch.data;
                this.dataOld = srch.data;
                if (!isDeleteRouting) {
                    this.treeControl.expand(this.treeControl.dataNodes.filter(e => e.routingId == data.routingId && !e.id)[0]);
                }
                if (isDeleteDetail) {
                    this.eEditRow(data);
                }
            } else {
                this.toastService.error(srch.description);
            }

        });
    }
    eDeleteDetail(data) {
        if (data.id && data.routingId) {
            if (data.id > 0) {
                let elements = this.treeControl.dataNodes.filter(el => el.id == data.id && el.routingId == data.routingId);
                if (elements && elements.length > 0) {
                    let root = this.treeControl.dataNodes.filter(el => !el.id && el.routingId == data.routingId);
                    if (root && root[0]) {
                        if (root[0].listRoutingDetailDTO) {
                            if(root[0].listRoutingDetailDTO.filter(el => el.id>0 && el.routingId == data.routingId).length>1){
                            const modalRef = this.modalService.open(CommonAlertDialogComponent, {
                                centered: true,
                                backdrop: false
                            });
                            modalRef.componentInstance.data = {
                                type: 'WARNING',
                                title: 'COMMON_MODAL.WARNING',
                                message: this.translate.instant('CONFIRM.DELETE_ROUTE_FROM_TO') 
                                    + data.fromProvinceName + " -> " + data.toProvinceName + "?",
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
                                        functionName: 'removeRoutingDetail',
                                        method: 'POST',
                                        params: {
                                            userName: this.userName,
                                            routingDetailDTO: {
                                                id: data.id
                                            }
                                        }
                                    };
                                    const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                                        if (res.errorCode == '0') {
                                            this.reloadData(data, false, true);
                                            this.toastService.success(this.translate.instant(
                                                'MESSAGE.DELETE_ROUTE_FROM_TO_SUCCESS')
                                                + data.fromProvinceName + " - " + data.toProvinceName
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
                            }else{
                                this.toastService.error(this.translate.instant('MESSAGE.ROUTE_NOT_DELETE'));
                            }
                        } else {
                            this.toastService.error(this.translate.instant('MESSAGE.NOT_FIND'));
                        }
                    } else {
                        this.toastService.error(this.translate.instant('MESSAGE.ROUTING_NOT_EXIST'));
                    }
                } else {
                    this.toastService.error(this.translate.instant('MESSAGE.ROUTE_NOT_EXIST'));
                }
            }else{
                this.objectEdit.listRoutingDetailDTO.pop();
                this.dataSource.data.forEach(e => {
                    if (e.routingId == this.objectEdit.routingId) {
                        e.listRoutingDetailDTO = this.objectEdit.listRoutingDetailDTO;
                    }
                });
                this.dataSource.data = this.dataSource.data;
                this.eEditRow(this.objectEdit);
            }
        } else {
            let elements = this.treeControl.dataNodes.filter(el => !el.id && el.routingId == data.routingId);
            if (elements && elements.length > 0) {
                let element = elements[0];
                if (element.routingId == data.routingId && !element.id) {
                    const modalRef = this.modalService.open(CommonAlertDialogComponent, {
                        centered: true,
                        backdrop: false
                    });
                    modalRef.componentInstance.data = {
                        type: 'WARNING',
                        title: 'COMMON_MODAL.WARNING',
                        message: this.translate.instant('CONFIRM.DELETE_ROUTING') + data.name + '?',
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
                                functionName: 'removeRouting',
                                method: 'POST',
                                params: {
                                    userName: this.userName,
                                    routingDTO: {
                                        routingId: data.routingId
                                    }
                                }
                            };
                            const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                                if (res.errorCode == '0') {
                                    this.reloadData(data, true, false);
                                    this.toastService.success(this.translate.instant(
                                        'MESSAGE.DELETE_ROUTING_FROM_TO_SUCCESS')
                                        + data.name + this.translate.instant('MESSAGE.SUCCESS'));
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
                    this.toastService.error(this.translate.instant('MESSAGE.ROUTER_NOT_EXIST'));
                }
            }
        }
    };

    addNew() {
        if (this.objectEdit) {
            if(this.isAddNew){
                this.toastService.error(this.translate.instant('MESSAGE.ADD_ROUTE_ACTIVE'));
            }else{
             this.toastService.error(this.translate.instant('MESSAGE.UPDATE_ROUTE_ACTIVE'));
            }
        } else {
            let routing = new RoutingDTO();
            routing.routingId = -1;
            let routingDetail = new RoutingDetailDTO();
            routingDetail.id = -1;
            routingDetail.routingId = -1;
            routingDetail.ord = 1;
            routing.listRoutingDetailDTO = [routingDetail];
            this.dataSource.data = JSON.parse(JSON.stringify([routing]));
            this.isAddNew = true;
            this.objectEdit = routing;
            this.eEditRow(routing);
        }
    }

    eAddNew() {
        let lastObj = this.objectEdit.listRoutingDetailDTO[this.objectEdit.listRoutingDetailDTO.length - 1];
        let routingDetail = new RoutingDetailDTO();
        routingDetail.id = lastObj.id - 1;
        routingDetail.routingId = -1;
        routingDetail.ord = lastObj.ord + 1;
        routingDetail.fromProvinceId = lastObj.toProvinceId;
        this.objectEdit.listRoutingDetailDTO.push(routingDetail);
        this.dataSource.data = JSON.parse(JSON.stringify([this.objectEdit]));
        this.isAddNew = true;
        this.eEditRow(this.objectEdit);
        this.treeControl.expandAll();
    }

    eEditAddNew() {
        let lastObj = this.objectEdit.listRoutingDetailDTO[this.objectEdit.listRoutingDetailDTO.length - 1];
        let routingDetail = new RoutingDetailDTO();
        routingDetail.id = lastObj.id > 0 ? -lastObj.id - 1 : lastObj.id - 1;
        routingDetail.routingId = this.objectEdit.routingId;
        routingDetail.ord = lastObj.ord + 1;
        routingDetail.isNew = true;
        routingDetail.fromProvinceId = lastObj.toProvinceId;
        this.objectEdit.listRoutingDetailDTO.push(routingDetail);
        this.dataSource.data.forEach(e => {
            if (e.routingId == this.objectEdit.routingId) {
                e.listRoutingDetailDTO = this.objectEdit.listRoutingDetailDTO;
            }
        });
        this.dataSource.data = this.dataSource.data;
        this.eEditRow(this.objectEdit);
    }

    eDeleteDetailForAdd() {
        this.objectEdit.listRoutingDetailDTO.pop();
        this.dataSource.data = JSON.parse(JSON.stringify([this.objectEdit]));
        this.isAddNew = true;
        this.eEditRow(this.objectEdit);
        this.treeControl.expandAll();
    }

    validate() {
        if (!this.objectEdit.name) {
            this.toastService.error(this.translate.instant('MESSAGE.ROUTE_NAME_NOT_BLANK'));
            return false;
        }
        if (!this.objectEdit.startProvinceId) {
            this.toastService.error(this.translate.instant('MESSAGE.FROM_PROVINCE_NOT_BLANK'));
            return false;
        }
        if (!this.objectEdit.endProvinceId) {
            this.toastService.error(this.translate.instant('MESSAGE.TO_PROVINCE_NOT_BLANK'));
            return false;
        }
        if (!this.objectEdit.listRoutingDetailDTO && this.objectEdit.listRoutingDetailDTO.length <= 0) {
            this.toastService.error(this.translate.instant('MESSAGE.ROUTE_REQUIRE'));
            return false;
        }
        for (let i = 0; i < this.objectEdit.listRoutingDetailDTO.length; i++) {
            let element = this.objectEdit.listRoutingDetailDTO[i];
            if (!element.fromProvinceId) { this.toastService.error(this.translate.instant('MESSAGE.FROM_PROVINCE_BELONG_ROUTE') + (i+1) + this.translate.instant('MESSAGE.NOT_BLANK')); return false }

            if (!element.toProvinceId) { this.toastService.error(this.translate.instant('MESSAGE.TO_PROVINCE_BELONG_ROUTE') + (i+1) + this.translate.instant('MESSAGE.NOT_BLANK')); return false }

            if (!element.price) { this.toastService.error(this.translate.instant('MESSAGE.COST_BELONG_ROUTE') + (i+1) + this.translate.instant('MESSAGE.NOT_BLANK')); return false }

            if (!element.vehicleType) { this.toastService.error(this.translate.instant('MESSAGE.VEHICLE_BELONG_ROUTE') + (i+1) + this.translate.instant('MESSAGE.NOT_BLANK')); return false }

            if (i == 0 && element.fromProvinceId != this.objectEdit.startProvinceId) {
                this.toastService.error(this.translate.instant('MESSAGE.PROVINCE_BEGIN_NOT_MATCH')); return false
            }

            if (i == this.objectEdit.listRoutingDetailDTO.length - 1 && element.toProvinceId != this.objectEdit.endProvinceId) {
                this.toastService.error(this.translate.instant('MESSAGE.PROVINCE_END_NOT_MATCH')); return false
            }
        };

        //Remove thousand separator of number fields
        this.objectEdit.listRoutingDetailDTO.forEach(detail => {
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
                message: this.translate.instant('CONFIRM.ADD_ROUTING') + this.objectEdit.name + "?",
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
                        functionName: 'addRouting',
                        method: 'POST',
                        params: {
                            userName: this.userName,
                            routingDTO: this.objectEdit
                        }
                    };
                    const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                        if (res.errorCode == '0') {
                            this.toastService.success(this.translate.instant('MESSAGE.ADD_ROUTING_FROM_TO_SUCCESS') + this.objectEdit.name + this.translate.instant('MESSAGE.SUCCESS'));
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
    ngOnInit(): void {
        this.userRes = JSON.parse(localStorage.getItem(CONFIG.KEY.RESPONSE_BODY_LOGIN));
        this.userName = localStorage.getItem(CONFIG.KEY.USER_NAME);
        this.staffId = this.userRes.staffId;
        this.isAdmin = this.userRes.isAdmin;
        this.getListVehicle();
        this.init();
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
            let search = this.dataOld.filter(
                    e=>((e.name?e.name:"")
                    +"-"+(e.startProvinceName?e.startProvinceName:"")
                    +"-"+(e.endProvinceName?e.endProvinceName:"")
                    +"-"+(e.note?e.note:"")
                    +"-"+(e.totalAmount?e.totalAmount:"")
                ).toLocaleLowerCase().includes(filterValue.toLocaleLowerCase()));
            this.dataSource.data=Object.assign([],search);
        }else{
            this.dataSource.data=Object.assign([],this.dataOld);
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
    }

    eSearch() {
        // if (!this.isValidForm()) {
        //   this.searchForm.markAllAsTouched();
        //   return;
        // }
        this.isLoading$ = true;
        const request = this.conditionSearch().subscribe(res => {
            this.isLoading$ = false;
            // tslint:disable-next-line:triple-equals
            if (res.errorCode == '0') {
                // this.dataSource = new MatTableDataSource(res.data);
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
            functionName: 'searchRouting',
            method: 'POST',
            params: {
                userName: this.userName
            }
        };
        return this.commonService.callAPICommon(requestTarget as RequestApiModel);
    }


    eDelete(item) {
        const modalRef = this.modalService.open(CommonAlertDialogComponent, {
            centered: true,
            backdrop: false
        });
        modalRef.componentInstance.data = {
            type: 'WARNING',
            title: 'COMMON_MODAL.WARNING',
            message: this.translate.instant('CONFIRM.DELETE_ROUTE_MOVE'),
            continue: true,
            cancel: true,
            btn: [
                { text: 'CANCEL', className: 'btn-outline-warning btn uppercase mx-2' },
                { text: 'CONTINUE', className: 'btn btn-warning uppercase mx-2' }
            ]
        };
        modalRef.result.then(
            result => {
                // const requestTarget = {
                //   functionName: 'deleteSpeedTestByAdmin',
                //   id: item.id
                // };
                // this.isLoading$ = true;
                // this.spinner.show();
                // const request = this.commonService.callAPICommon(requestTarget as RequestApiModel).subscribe(res => {
                //   this.spinner.hide();
                //   this.isLoading$ = false;
                //   if (res.errorCode == '0') {
                //     this.toastService.success(this.translate.instant('MANAGE_SPEEDTEST.MESSAGE.DELETE_SUCCESS'));
                //     // this.eResetForm();
                //     this.eSearch();
                //   } else {
                //     this.toastService.error(res.description);
                //     this.eSearch();
                //   }
                // });
                // this.subscriptions.push(request);
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

    ngOnDestroy(): void {
        this.subscriptions.forEach((sb) => sb.unsubscribe());
    }
}
