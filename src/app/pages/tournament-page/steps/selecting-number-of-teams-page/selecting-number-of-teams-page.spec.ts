import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectingNumberOfTeamsPage } from './selecting-number-of-teams-page';

describe('SelectingNumberOfTeamsPage', () => {
  let component: SelectingNumberOfTeamsPage;
  let fixture: ComponentFixture<SelectingNumberOfTeamsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectingNumberOfTeamsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectingNumberOfTeamsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
