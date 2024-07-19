import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllChannelComponent } from './all-channel.component';

describe('AllChannelComponent', () => {
  let component: AllChannelComponent;
  let fixture: ComponentFixture<AllChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
