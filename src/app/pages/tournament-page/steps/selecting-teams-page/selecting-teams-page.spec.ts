import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectingTeamsPage } from './selecting-teams-page';

describe('SelectingTeamsPage', () => {
  let component: SelectingTeamsPage;
  let fixture: ComponentFixture<SelectingTeamsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectingTeamsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectingTeamsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
