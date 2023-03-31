/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TrinhKyVofficeComponent } from './trinh-ky-voffice.component';

describe('TrinhKyVofficeComponent', () => {
  let component: TrinhKyVofficeComponent;
  let fixture: ComponentFixture<TrinhKyVofficeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrinhKyVofficeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrinhKyVofficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
