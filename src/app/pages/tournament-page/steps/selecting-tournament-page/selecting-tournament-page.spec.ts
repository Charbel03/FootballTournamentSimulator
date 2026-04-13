import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectingTournamentPage } from './selecting-tournament-page';

describe('SelectingTournamentPage', () => {
  let component: SelectingTournamentPage;
  let fixture: ComponentFixture<SelectingTournamentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectingTournamentPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectingTournamentPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
