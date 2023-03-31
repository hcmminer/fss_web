/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TabQuanLyCongTacPhiComponent } from './tab-quan-ly-cong-tac-phi.component';

describe('TabQuanLyCongTacPhiComponent', () => {
  let component: TabQuanLyCongTacPhiComponent;
  let fixture: ComponentFixture<TabQuanLyCongTacPhiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabQuanLyCongTacPhiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabQuanLyCongTacPhiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
