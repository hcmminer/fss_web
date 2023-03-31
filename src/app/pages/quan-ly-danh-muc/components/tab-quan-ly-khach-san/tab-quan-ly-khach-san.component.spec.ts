/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TabQuanLyKhachSanComponent } from './tab-quan-ly-khach-san.component';

describe('TabQuanLyKhachSanComponent', () => {
  let component: TabQuanLyKhachSanComponent;
  let fixture: ComponentFixture<TabQuanLyKhachSanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabQuanLyKhachSanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabQuanLyKhachSanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
