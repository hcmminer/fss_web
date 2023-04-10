import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'app-popup-message',
    templateUrl: './popup-message.component.html',
    styleUrls: ['./popup-message.component.scss']
})
export class PopupMessageComponent implements OnInit{
    @Output() closeSubContent = new EventEmitter<any>();
    @Output() next = new EventEmitter<any>();
    ngOnInit(){

    }
    constructor(public modal: NgbModal, public modalService: NgbActiveModal) {
    }

    handleCloseSubContent(){
        this.closeSubContent.emit(true);
    }

    closeAll(){
        this.next.emit(true);
        this.modal.dismissAll();
    }
}
