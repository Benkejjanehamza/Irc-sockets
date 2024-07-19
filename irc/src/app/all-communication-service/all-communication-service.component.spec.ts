import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCommunicationServiceComponent } from './all-communication-service.component';

describe('AllCommunicationServiceComponent', () => {
  let component: AllCommunicationServiceComponent;
  let fixture: ComponentFixture<AllCommunicationServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCommunicationServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCommunicationServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
