/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DanhSachPhieuCongTacComponent } from './danh-sach-phieu-cong-tac.component';

describe('DanhSachPhieuCongTacComponent', () => {
  let component: DanhSachPhieuCongTacComponent;
  let fixture: ComponentFixture<DanhSachPhieuCongTacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DanhSachPhieuCongTacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DanhSachPhieuCongTacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
