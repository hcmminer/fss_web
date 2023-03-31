/* tslint:disable */
import {Component, HostBinding, HostListener, Input, OnInit, Output, ViewChild, EventEmitter} from '@angular/core';
import {FormBuilder, FormGroup, RequiredValidator, Validators} from '@angular/forms';
import {ElementRef} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {coerceBooleanProperty} from '../helper';

enum KEY_CODE {
  BACKSPACE = 8,
  DELETE = 46
}


@Component({
  selector: 'custom-dropzone-preview',
  template: `
		<ng-content select="custom-dropzone-label"></ng-content>
		<custom-dropzone-remove-badge *ngIf="removable" (click)="_remove($event)">
		</custom-dropzone-remove-badge>
	`,
  styleUrls: ['./custom-dropzone-preview.component.scss']
})
export class CustomDropzonePreviewComponent {

  constructor(
   protected sanitizer: DomSanitizer
  ) { }

  protected _file: File;

  /** The file to preview. */
  @Input()
  set file(value: File) { this._file = value; }
  get file(): File { return this._file; }

  /** Allow the user to remove files. */
  @Input()
  get removable(): boolean {
    return this._removable;
  }
  set removable(value: boolean) {
    this._removable = coerceBooleanProperty(value);
  }
  protected _removable = false;

  /** Emitted when the element should be removed. */
  @Output() readonly removed = new EventEmitter<File>();

  @HostListener('keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    switch (event.keyCode) {
      case KEY_CODE.BACKSPACE:
      case KEY_CODE.DELETE:
        this.remove();
        break;
      default:
        break;
    }
  }

  /** We use the HostBinding to pass these common styles to child components. */
  @HostBinding('style')
  get hostStyle(): SafeStyle {
    const styles = `
			display: flex;
			height: 30px;
			min-height: 60px;
			min-width: 60px;
			align-items: center;
			padding: 0 20px;
			border-radius: 5px;
			position: relative;
			margin-right: auto;
		`;

    return this.sanitizer.bypassSecurityTrustStyle(styles);
  }

  /** Make the preview item focusable using the tab key. */
  @HostBinding('tabindex') tabIndex = 0;

  /** Remove method to be used from the template. */
  _remove(event) {
    event.stopPropagation();
    this.remove();
  }

  /** Remove the preview item (use from component code). */
  remove() {
    if (this._removable) {
      this.removed.next(this.file);
    }
  }

  protected async readFile(): Promise<string | ArrayBuffer> {
    return new Promise<string | ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => {
        resolve((e.target as FileReader).result);
      };

      reader.onerror = e => {
        console.error(`FileReader failed on file ${this.file.name}.`);
        reject(e);
      };

      if (!this.file) {
        return reject('No file to read. Please provide a file using the [file] Input property.');
      }

      reader.readAsDataURL(this.file);
    });
  }
}


