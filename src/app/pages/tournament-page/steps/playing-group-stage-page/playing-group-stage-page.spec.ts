import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayingGroupStagePage } from './playing-group-stage-page';

describe('PlayingGroupStagePage', () => {
  let component: PlayingGroupStagePage;
  let fixture: ComponentFixture<PlayingGroupStagePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayingGroupStagePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayingGroupStagePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
