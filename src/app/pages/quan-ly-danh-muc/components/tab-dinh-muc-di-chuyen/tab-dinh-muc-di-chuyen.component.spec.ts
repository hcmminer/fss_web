/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TabDinhMucDiChuyenComponent } from './tab-dinh-muc-di-chuyen.component';

describe('TabDinhMucDiChuyenComponent', () => {
  let component: TabDinhMucDiChuyenComponent;
  let fixture: ComponentFixture<TabDinhMucDiChuyenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabDinhMucDiChuyenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabDinhMucDiChuyenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
