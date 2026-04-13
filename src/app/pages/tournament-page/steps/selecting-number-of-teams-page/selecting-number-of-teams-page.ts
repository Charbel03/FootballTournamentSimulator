import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService } from '../../../../services/tournament-service';

interface TeamOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-selecting-number-of-teams-page',
  imports: [CommonModule],
  templateUrl: './selecting-number-of-teams-page.html',
  styleUrl: './selecting-number-of-teams-page.css',
})
export class SelectingNumberOfTeamsPage {

  private tournamentService = inject(TournamentService);

  @Output() nextStep = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  teamOptions: TeamOption[] = [
    { value: 8, label: '8 Teams' },
    { value: 16, label: '16 Teams' },
    { value: 32, label: '32 Teams' },
    { value: 48, label: '48 Teams' }
  ];


  selectTeamCount(count: number): void {
    this.tournamentService.setNumberOfTeams(count);
    
    this.nextStep.emit();
  }

  back(){
    this.goBack.emit();
  }
}