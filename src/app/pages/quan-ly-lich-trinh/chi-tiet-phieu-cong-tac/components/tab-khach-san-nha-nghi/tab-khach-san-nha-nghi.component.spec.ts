/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TabKhachSanNhaNghiComponent } from './tab-khach-san-nha-nghi.component';

describe('TabKhachSanNhaNghiComponent', () => {
  let component: TabKhachSanNhaNghiComponent;
  let fixture: ComponentFixture<TabKhachSanNhaNghiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabKhachSanNhaNghiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabKhachSanNhaNghiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
