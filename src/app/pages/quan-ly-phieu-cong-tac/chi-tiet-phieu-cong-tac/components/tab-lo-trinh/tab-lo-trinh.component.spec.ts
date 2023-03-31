/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TabLoTrinhComponent } from './tab-lo-trinh.component';

describe('TabLoTrinhComponent', () => {
  let component: TabLoTrinhComponent;
  let fixture: ComponentFixture<TabLoTrinhComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabLoTrinhComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabLoTrinhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
