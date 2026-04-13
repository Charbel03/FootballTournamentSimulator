import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayingKnockoutStagePage } from './playing-knockout-stage-page';

describe('PlayingKnockoutStagePage', () => {
  let component: PlayingKnockoutStagePage;
  let fixture: ComponentFixture<PlayingKnockoutStagePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayingKnockoutStagePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayingKnockoutStagePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
