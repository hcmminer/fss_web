/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddEditTabDinhMucDiChuyenComponent } from './add-edit-tab-dinh-muc-di-chuyen.component';

describe('AddEditTabDinhMucDiChuyenComponent', () => {
  let component: AddEditTabDinhMucDiChuyenComponent;
  let fixture: ComponentFixture<AddEditTabDinhMucDiChuyenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditTabDinhMucDiChuyenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditTabDinhMucDiChuyenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
