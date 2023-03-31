/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { KetThucPhieuCongTacComponent } from './ket-thuc-phieu-cong-tac.component';

describe('KetThucPhieuCongTacComponent', () => {
  let component: KetThucPhieuCongTacComponent;
  let fixture: ComponentFixture<KetThucPhieuCongTacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KetThucPhieuCongTacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KetThucPhieuCongTacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
