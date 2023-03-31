import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LanguageSelectorComponent} from './language-selector/language-selector.component';
import {NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [LanguageSelectorComponent],
  exports: [LanguageSelectorComponent],
  imports: [
    CommonModule,
    NgbDropdownModule
  ]
})
export class SharedLanguageSelectionModule { }
