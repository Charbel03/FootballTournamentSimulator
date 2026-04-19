import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentCard } from '../../../../interfaces/tournament';
import { TournamentService } from '../../../../services/tournament-service';

@Component({
  selector: 'app-selecting-tournament-page',
  imports: [CommonModule],
  templateUrl: './selecting-tournament-page.html',
  styleUrl: './selecting-tournament-page.css',
})

export class SelectingTournamentPage {

  private tournamentService = inject(TournamentService);

  @Output() nextStep = new EventEmitter<void>();

  tournamentCards: TournamentCard[] = [
    {
      id: 1,
      title: 'Custom Nation Teams',
      description: 'Create a tournament with national teams.',
      icon: '🌐',
      active: true
    },
    {
      id: 2,
      title: 'Custom Teams',
      description: 'Build your own tournament with club teams.',
      icon: '👥',
      active: true
    },
    {
      id: 3,
      title: 'Champions League',
      description: 'Simulate the UCL format.',
      icon: '🏆',
      active: false
    },
    {
      id: 4,
      title: 'World Cup',
      description: 'Simulate the FIFA World Cup.',
      icon: '⚽',
      active: false
    }
  ];

  selectTournament(card: TournamentCard) {
    this.tournamentService.setTournament(card.id, card.title);
    this.nextStep.emit();
  }
}