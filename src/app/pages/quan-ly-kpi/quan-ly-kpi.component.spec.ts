import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuanLyKpiComponent } from './quan-ly-kpi.component';

describe('QuanLyKpiComponent', () => {
  let component: QuanLyKpiComponent;
  let fixture: ComponentFixture<QuanLyKpiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuanLyKpiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuanLyKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
