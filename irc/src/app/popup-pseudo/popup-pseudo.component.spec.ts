import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupPseudoComponent } from './popup-pseudo.component';

describe('PopupPseudoComponent', () => {
  let component: PopupPseudoComponent;
  let fixture: ComponentFixture<PopupPseudoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupPseudoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupPseudoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
