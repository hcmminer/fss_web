import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAddImportIncreaseAssetComponent } from './form-add-import-increase-asset.component';

describe('FormAddImportIncreaseAssetComponent', () => {
  let component: FormAddImportIncreaseAssetComponent;
  let fixture: ComponentFixture<FormAddImportIncreaseAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormAddImportIncreaseAssetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAddImportIncreaseAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
