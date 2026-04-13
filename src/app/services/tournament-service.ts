import { Injectable, signal, computed } from '@angular/core';
import { TournamentFlowState } from '../interfaces/tournament';
import { Team, TeamGroup } from '../interfaces/team';

@Injectable({
  providedIn: 'root',
})

export class TournamentService {
  
  private readonly initialState: TournamentFlowState = {
    tournament: {
      id: null,
      title: null
    },
    numberOfTeams: null,
    allTeams: [],
    groupStageTeams: [],
    knockoutStageTeams: []
  };

  state = signal<TournamentFlowState>(this.initialState);

  tournament = computed(() => this.state().tournament);
  numberOfTeams = computed(() => this.state().numberOfTeams);
  allTeams = computed(() => this.state().allTeams);
  groupStageTeams = computed(() => this.state().groupStageTeams);
  knockoutStageTeams = computed(() => this.state().knockoutStageTeams);

  setTournament(id: number, title: string) {
    this.state.update(state => ({
      ...state,
      tournament: { id, title }
    }));
  }

  setNumberOfTeams(numberOfTeams: number) {
    this.state.update(state => ({
      ...state,
      numberOfTeams
    }));
  }

  setAllTeams(allTeams: Team[]) {
    this.state.update(state => ({
      ...state,
      allTeams
    }));
  }

  setGroupStageTeams(groupStageTeams: TeamGroup[]) {
    this.state.update(state => ({
      ...state,
      groupStageTeams
    }));
  }

  setKnockoutStageTeams(knockoutStageTeams: TeamGroup[]) {
    this.state.update(state => ({
      ...state,
      knockoutStageTeams
    }));
  }

  reset() {
    this.state.set(this.initialState);
  }
}
