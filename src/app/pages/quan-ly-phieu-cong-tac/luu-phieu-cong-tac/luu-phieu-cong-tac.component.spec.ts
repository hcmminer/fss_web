/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LuuPhieuCongTacComponent } from './luu-phieu-cong-tac.component';

describe('LuuPhieuCongTacComponent', () => {
  let component: LuuPhieuCongTacComponent;
  let fixture: ComponentFixture<LuuPhieuCongTacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LuuPhieuCongTacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LuuPhieuCongTacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
