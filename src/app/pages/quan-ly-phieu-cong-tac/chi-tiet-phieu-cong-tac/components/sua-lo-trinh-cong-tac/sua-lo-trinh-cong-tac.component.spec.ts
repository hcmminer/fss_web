/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SuaLoTrinhCongTacComponent } from './sua-lo-trinh-cong-tac.component';

describe('SuaLoTrinhCongTacComponent', () => {
  let component: SuaLoTrinhCongTacComponent;
  let fixture: ComponentFixture<SuaLoTrinhCongTacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuaLoTrinhCongTacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuaLoTrinhCongTacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
