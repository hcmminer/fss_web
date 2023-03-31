/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TabFileDinhKemComponent } from './tab-file-dinh-kem.component';

describe('TabFileDinhKemComponent', () => {
  let component: TabFileDinhKemComponent;
  let fixture: ComponentFixture<TabFileDinhKemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabFileDinhKemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabFileDinhKemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
