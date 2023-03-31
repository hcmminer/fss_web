/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddEditTabQuanLyCongTacPhiComponent } from './add-edit-tab-quan-ly-cong-tac-phi.component';

describe('AddEditTabQuanLyCongTacPhiComponent', () => {
  let component: AddEditTabQuanLyCongTacPhiComponent;
  let fixture: ComponentFixture<AddEditTabQuanLyCongTacPhiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditTabQuanLyCongTacPhiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditTabQuanLyCongTacPhiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
