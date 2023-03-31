/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TabChiPhiKhacComponent } from './tab-chi-phi-khac.component';

describe('TabChiPhiKhacComponent', () => {
  let component: TabChiPhiKhacComponent;
  let fixture: ComponentFixture<TabChiPhiKhacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabChiPhiKhacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabChiPhiKhacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
