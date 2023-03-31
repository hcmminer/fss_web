import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { CommonDialogModel } from '../../_models/common-dialog-model';

@Component({
  selector: 'app-common-alert-dialog',
  templateUrl: './common-alert-dialog.component.html',
  styleUrls: ['./common-alert-dialog.component.scss']
})
export class CommonAlertDialogComponent implements OnInit {

  data: CommonDialogModel;
  headerClass: any;
  closeIconSrc: any;
  defaultIconSrc: any = '/assets/icon/';
  iconSrc: any;
  confirmInputTextValue: string = '';
  confirmInputTextInvalidMsg: string = '';

  constructor(public activeModal: NgbActiveModal) {
  }

  cancel() {
    // TechAsians thêm trường hợp: với việc sử dụng các modal này vào việc confirm thành công => ấn button X (đóng modal) với data giống như close có data
    if(this.data.hasCancelLikeClose){
      this.close(this.data.hasCancelLikeCloseStr || 'close');
    }else{
    this.activeModal.dismiss('cancel');
    }
  }

  close(msg) {
    this.activeModal.close(msg);
  }

  ngOnInit() {
    switch (this.data.type) {
      case 'ERROR': {
        this.headerClass = 'danger';
        this.closeIconSrc = this.defaultIconSrc + 'icon-error-20px.svg';
        this.iconSrc = this.defaultIconSrc + 'icon-error-72px.svg';
        break;
      }
      case 'SUCCESS': {
        this.headerClass = 'success';
        this.closeIconSrc = this.defaultIconSrc + 'icon-close-success.svg';
        this.iconSrc = this.defaultIconSrc + 'icon-success-72px.svg';
        break;
      }
      case 'WARNING': {
        this.headerClass = 'warning';
        this.closeIconSrc = this.defaultIconSrc + 'icon-close-warning.svg';
        this.iconSrc = this.defaultIconSrc + 'icon-warning-72px.svg';
        break;
      }
      case 'INFO': {
        this.headerClass = 'info';
        this.closeIconSrc = this.defaultIconSrc + 'icon-close-info.svg';
        this.iconSrc = this.defaultIconSrc + 'icon-information-72px.svg';
        break;
      }
    }
  }

  eventClick(text: any) {
      if(text.toUpperCase()==='CANCEL' || text.toUpperCase()==='HUY'){
          this.cancel();
      } else {
          if (this.data.enableConfirmInputText) {
            if (this.data.requiredConfirmInputText) {
              if (this.confirmInputTextValue && this.confirmInputTextValue !== '') {
                this.close(this.confirmInputTextValue);
              } else {
                this.confirmInputTextInvalidMsg = this.data.requiredErrorMessage;
              }
            } else {
              this.close(this.confirmInputTextValue);
            }
          } else {
            this.close(text);
          }
      }
  }
}
