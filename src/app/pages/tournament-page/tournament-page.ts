import { Component, signal, inject } from '@angular/core';
import { SelectingTournamentPage } from './steps/selecting-tournament-page/selecting-tournament-page';
import { SelectingNumberOfTeamsPage } from './steps/selecting-number-of-teams-page/selecting-number-of-teams-page';
import { SelectingTeamsPage } from './steps/selecting-teams-page/selecting-teams-page';
import { PlayingGroupStagePage } from './steps/playing-group-stage-page/playing-group-stage-page';
import { PlayingKnockoutStagePage } from './steps/playing-knockout-stage-page/playing-knockout-stage-page';
import { TournamentService } from '../../services/tournament-service';
import { CountryService } from '../../services/country-service';
import { ClubTeamService } from '../../services/club-team-service';
import { LocalStorageService } from '../../services/local-storage-service';
import { Team  } from '../../interfaces/team';

export enum Step {
  SelectingTournament = 1,
  SelectingNumberOfTeams = 2,
  SelectingTeams = 3,
  PlayingGroupStage = 4,
  PlayingKnockoutStage = 5
}

@Component({
  selector: 'app-tournament-page',
  imports: [SelectingTournamentPage, SelectingNumberOfTeamsPage, SelectingTeamsPage, PlayingGroupStagePage, PlayingKnockoutStagePage],
  templateUrl: './tournament-page.html',
  styleUrl: './tournament-page.css',
})


export class TournamentPage {
  private tournamentService = inject(TournamentService);
  private countryService = inject(CountryService);
  private clubTeamService = inject(ClubTeamService);
  private localStorageService = inject(LocalStorageService);

  Step = Step;

  currentStep = signal<Step>(Step.SelectingTournament);

  goToSelectingNumberOfTeams() {
    this.currentStep.set(Step.SelectingNumberOfTeams);
  }

  goToSelectingTeams() {
    const tournamentId = this.tournamentService.tournament().id;

    if (tournamentId === null) {
      return;
    }

    const cachedTeams = this.localStorageService.getTeams(tournamentId);

    if (cachedTeams) {
      this.tournamentService.setAllTeams(cachedTeams);
      this.currentStep.set(Step.SelectingTeams);
      return;
    }

    switch (tournamentId) {
      case 1:
        this.countryService.getCountries().subscribe((countries) => {
          const mappedTeams: Team[] = countries.map((country) => ({
            name: country.name.common,
            logo: country.flagSvg
          }));

          this.tournamentService.setAllTeams(mappedTeams);
          this.localStorageService.setTeams(tournamentId, mappedTeams);
          this.currentStep.set(Step.SelectingTeams);
        });
        return;

      case 2:
        this.clubTeamService.getAllTopLeagueTeams().subscribe({
          next: (allTeams) => {

            this.tournamentService.setAllTeams(allTeams);
            this.localStorageService.setTeams(tournamentId, allTeams);
            this.currentStep.set(Step.SelectingTeams);
          },
          error: (err) => {
            console.error('Error Fetching Club Teams', err);
          }
        });
        return;

      default:
        return;
    }
  }

  goToPlayingGroupStage() {
    this.currentStep.set(Step.PlayingGroupStage);
  }

  goToPlayingKnockoutStage() {
    this.currentStep.set(Step.PlayingKnockoutStage);
  }

  goToSelectingTournament() {
    this.tournamentService.reset();
    this.currentStep.set(Step.SelectingTournament);
  }
}