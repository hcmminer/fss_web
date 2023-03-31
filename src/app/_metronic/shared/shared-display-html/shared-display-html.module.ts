import { TruncatePipe } from './../../../utils/TruncatePipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SafeHtmlPipe} from '../../../pipes/safeHtml.pipe';
import {CoordinateDirective} from './coordinate.directives';
import { SafeResourceUrlPipe } from '../../../pipes/safeResourceUrl.pipe';
import { NumbersOnlyDirective } from './only-number.directives';



@NgModule({
  declarations: [SafeHtmlPipe, SafeResourceUrlPipe, CoordinateDirective, NumbersOnlyDirective, TruncatePipe],
  exports: [SafeHtmlPipe, SafeResourceUrlPipe, CoordinateDirective, NumbersOnlyDirective, TruncatePipe],
  imports: [
    CommonModule
  ]
})
export class SharedDisplayHtmlModule { }
