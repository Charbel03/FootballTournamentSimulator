import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentPage } from './tournament-page';

describe('TournamentPage', () => {
  let component: TournamentPage;
  let fixture: ComponentFixture<TournamentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
