/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TabQuanLyLoTrinhComponent } from './tab-quan-ly-lo-trinh.component';

describe('TabQuanLyLoTrinhComponent', () => {
  let component: TabQuanLyLoTrinhComponent;
  let fixture: ComponentFixture<TabQuanLyLoTrinhComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabQuanLyLoTrinhComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabQuanLyLoTrinhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
