/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StaffsManagerComponent } from './tab-staffs-manager.component';

describe('StaffsManagerComponent', () => {
  let component: StaffsManagerComponent;
  let fixture: ComponentFixture<StaffsManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StaffsManagerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
