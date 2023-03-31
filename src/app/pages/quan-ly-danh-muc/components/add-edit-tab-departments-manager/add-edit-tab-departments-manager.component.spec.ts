/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddEditTabDepartmentsManagerComponent } from './add-edit-tab-departments-manager.component';

describe('AddEditTabDepartmentsManagerComponent', () => {
  let component: AddEditTabDepartmentsManagerComponent;
  let fixture: ComponentFixture<AddEditTabDepartmentsManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditTabDepartmentsManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditTabDepartmentsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
