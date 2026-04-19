import { TestBed } from '@angular/core/testing';

import { ClubTeamService } from './club-team-service';

describe('ClubTeamService', () => {
  let service: ClubTeamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClubTeamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
