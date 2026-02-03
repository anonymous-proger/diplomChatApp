import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmojiPanelComponent } from './emoji-panel.component';

describe('EmojiPanelComponent', () => {
  let component: EmojiPanelComponent;
  let fixture: ComponentFixture<EmojiPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmojiPanelComponent]
    });
    fixture = TestBed.createComponent(EmojiPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
