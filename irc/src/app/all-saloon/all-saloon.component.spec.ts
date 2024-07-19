import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSaloonComponent } from './all-saloon.component';

describe('AllSaloonComponent', () => {
  let component: AllSaloonComponent;
  let fixture: ComponentFixture<AllSaloonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllSaloonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllSaloonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
