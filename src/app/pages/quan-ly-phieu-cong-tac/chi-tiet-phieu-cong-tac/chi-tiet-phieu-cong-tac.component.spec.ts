/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChiTietPhieuCongTacComponent } from './chi-tiet-phieu-cong-tac.component';

describe('ChiTietPhieuCongTacComponent', () => {
  let component: ChiTietPhieuCongTacComponent;
  let fixture: ComponentFixture<ChiTietPhieuCongTacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChiTietPhieuCongTacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChiTietPhieuCongTacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
