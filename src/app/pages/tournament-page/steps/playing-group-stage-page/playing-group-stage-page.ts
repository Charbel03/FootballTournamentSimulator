import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, EventEmitter, Output } from '@angular/core';
import { Team, TeamGroup } from '../../../../interfaces/team';
import { TournamentService } from '../../../../services/tournament-service';

type MatchResult = 'home' | 'draw' | 'away' | null;

interface GroupMatch {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  result: MatchResult;
}

interface GroupStandingRow {
  position: number;
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

@Component({
  selector: 'app-playing-group-stage-page',
  imports: [CommonModule],
  templateUrl: './playing-group-stage-page.html',
  styleUrl: './playing-group-stage-page.css',
})
export class PlayingGroupStagePage {
  private readonly tournamentService = inject(TournamentService);

  readonly groups = computed(() => this.tournamentService.groupStageTeams());
  readonly activeGroupIndex = signal(0);

  readonly groupMatches = signal<Record<string, GroupMatch[]>>({});

  @Output() nextStep = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  constructor() {
    this.initializeMatches();
  }

  back(){
    this.goBack.emit();
  }

  readonly activeGroup = computed(() => {
    const groups = this.groups();
    const index = this.activeGroupIndex();
    return groups[index] ?? null;
  });

  readonly activeGroupMatches = computed(() => {
    const group = this.activeGroup();
    if (!group) {
      return [];
    }

    return this.groupMatches()[group.name] ?? [];
  });

  readonly activeGroupStandings = computed(() => {
    const group = this.activeGroup();
    if (!group) {
      return [];
    }

    return this.buildStandings(group, this.activeGroupMatches());
  });

  selectGroup(index: number): void {
    this.activeGroupIndex.set(index);
  }

  setMatchResult(groupName: string, matchId: string, result: MatchResult): void {
    const current = this.groupMatches();
    const groupFixtures = current[groupName] ?? [];

    const updatedFixtures = groupFixtures.map((match) =>
      match.id === matchId ? { ...match, result } : match
    );

    this.groupMatches.set({
      ...current,
      [groupName]: updatedFixtures,
    });
  }

  isSelectedResult(match: GroupMatch, result: MatchResult): boolean {
    return match.result === result;
  }

  canContinue(): boolean {
    const groups = this.groups();
    const matches = this.groupMatches();

    return groups.every((group) => {
      const fixtures = matches[group.name] ?? [];
      return fixtures.length > 0 && fixtures.every((fixture) => fixture.result !== null);
    });
  }

  onContinue(): void {
    if (!this.canContinue()) {
      return;
    }

    const qualifiedGroups: TeamGroup[] = this.groups().map((group) => {
      const standings = this.buildStandings(
        group,
        this.groupMatches()[group.name] ?? []
      );

      return {
        name: group.name,
        teams: standings.slice(0, 2).map((row) => row.team),
      };
    });

    this.tournamentService.setKnockoutStageTeams(qualifiedGroups);

    this.nextStep.emit();
    
  }

  trackByGroupName(_: number, group: TeamGroup): string {
    return group.name;
  }

  trackByMatchId(_: number, match: GroupMatch): string {
    return match.id;
  }

  private initializeMatches(): void {
    const groups = this.groups();

    const generatedMatches: Record<string, GroupMatch[]> = {};

    for (const group of groups) {
      const validTeams = group.teams.filter((team): team is Team => team !== null);
      generatedMatches[group.name] = this.generateFixtures(validTeams);
    }

    this.groupMatches.set(generatedMatches);
  }

  private generateFixtures(teams: Team[]): GroupMatch[] {
    const fixtures: GroupMatch[] = [];

    for (let homeIndex = 0; homeIndex < teams.length; homeIndex++) {
      for (let awayIndex = homeIndex + 1; awayIndex < teams.length; awayIndex++) {
        const homeTeam = teams[homeIndex];
        const awayTeam = teams[awayIndex];

        fixtures.push({
          id: `${homeTeam.name}-${awayTeam.name}`,
          homeTeam,
          awayTeam,
          result: null,
        });
      }
    }

    return fixtures;
  }

  private buildStandings(group: TeamGroup, matches: GroupMatch[]): GroupStandingRow[] {
    const validTeams = group.teams.filter((team): team is Team => team !== null);

    const table = new Map<string, GroupStandingRow>(
      validTeams.map((team) => [
        team.name,
        {
          position: 0,
          team,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          points: 0,
        },
      ])
    );

    for (const match of matches) {
      if (!match.result) {
        continue;
      }

      const home = table.get(match.homeTeam.name);
      const away = table.get(match.awayTeam.name);

      if (!home || !away) {
        continue;
      }

      home.played += 1;
      away.played += 1;

      if (match.result === 'home') {
        home.wins += 1;
        home.points += 3;
        away.losses += 1;
      } else if (match.result === 'away') {
        away.wins += 1;
        away.points += 3;
        home.losses += 1;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    }

    return [...table.values()]
      .sort((first, second) => {
        if (second.points !== first.points) {
          return second.points - first.points;
        }

        if (second.wins !== first.wins) {
          return second.wins - first.wins;
        }

        return first.team.name.localeCompare(second.team.name);
      })
      .map((row, index) => ({
        ...row,
        position: index + 1,
      }));
  }
}