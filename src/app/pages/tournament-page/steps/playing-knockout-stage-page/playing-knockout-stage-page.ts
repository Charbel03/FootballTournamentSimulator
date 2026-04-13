import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, effect, inject, signal } from '@angular/core';
import { Team, TeamGroup } from '../../../../interfaces/team';
import { TournamentService } from '../../../../services/tournament-service';

type KnockoutStageKey =
  | 'roundOf24'
  | 'roundOf16'
  | 'quarterFinals'
  | 'semiFinals'
  | 'final';

interface KnockoutMatch {
  id: string;
  stage: KnockoutStageKey;
  homeTeam: Team | null;
  awayTeam: Team | null;
  winner: Team | null;
  nextMatchId: string | null;
  nextSlot: 'home' | 'away' | null;
}

interface KnockoutStageColumn {
  key: KnockoutStageKey;
  label: string;
  matches: KnockoutMatch[];
}

interface StageDefinition {
  key: KnockoutStageKey;
  label: string;
  matchCount: number;
}

@Component({
  selector: 'app-playing-knockout-stage-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './playing-knockout-stage-page.html',
  styleUrl: './playing-knockout-stage-page.css',
})
export class PlayingKnockoutStagePage {
  private readonly tournamentService = inject(TournamentService);

  @Output() nextStep = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  readonly knockoutGroups = computed(() => this.tournamentService.knockoutStageTeams());
  readonly stages = signal<KnockoutStageColumn[]>([]);
  readonly unsupportedMessage = signal<string | null>(null);

  private readonly stageLabels: Record<KnockoutStageKey, string> = {
    roundOf24: 'Round of 24',
    roundOf16: 'Round of 16',
    quarterFinals: 'Quarter-finals',
    semiFinals: 'Semi-finals',
    final: 'Final',
  };

  readonly finalStage = computed(
    () => this.stages().find((stage) => stage.key === 'final') ?? null
  );

  readonly champion = computed(() => this.finalStage()?.matches[0]?.winner ?? null);

  readonly leftStages = computed(() => this.buildSideStages('left'));
  readonly rightStages = computed(() => this.buildSideStages('right'));

  readonly leftBaseMatches = computed(() => this.getBaseMatchCount(this.leftStages()));
  readonly rightBaseMatches = computed(() => this.getBaseMatchCount(this.rightStages()));

  readonly leftRows = computed(() => this.leftBaseMatches() * 2);
  readonly rightRows = computed(() => this.rightBaseMatches() * 2);

  constructor() {
    effect(() => {
      this.buildBracket(this.knockoutGroups());
    });
  }

  back(){
    this.goBack.emit();
  }

  trackStage = (_: number, stage: KnockoutStageColumn): string => stage.key;
  trackMatch = (_: number, match: KnockoutMatch): string => match.id;

  selectWinner(matchId: string, team: Team | null): void {
    if (!team) {
      return;
    }

    const nextStages = this.cloneStages(this.stages());
    const match = this.findMatch(nextStages, matchId);

    if (!match || !this.isTeamInMatch(match, team)) {
      return;
    }

    match.winner = team;
    this.propagateForward(nextStages, match);
    this.stages.set(nextStages);
  }

  isWinner(match: KnockoutMatch, team: Team | null): boolean {
    return !!team && !!match.winner && match.winner.name === team.name;
  }

  canReset(): boolean {
    return this.champion() !== null;
  }

  onReset(): void {
    if (!this.canReset()) {
      return;
    }

    this.nextStep.emit();
  }

  getGridRow(matchCount: number, matchIndex: number, baseMatches: number): string {
    const totalRows = Math.max(2, baseMatches * 2);
    const step = totalRows / matchCount;
    const start = Math.round(matchIndex * step + step / 2);

    return `${start} / span 1`;
  }

  private buildBracket(groups: TeamGroup[]): void {
    const seededTeams = this.buildSeededTeams(groups);

    if (!seededTeams.length) {
      this.stages.set([]);
      this.unsupportedMessage.set(null);
      return;
    }

    const builtStages = this.createBracket(seededTeams);

    if (!builtStages) {
      this.stages.set([]);
      this.unsupportedMessage.set(
        `This knockout format is not supported yet for ${seededTeams.length} qualified teams.`
      );
      return;
    }

    this.unsupportedMessage.set(null);
    this.stages.set(builtStages);
  }

  private createBracket(teams: Team[]): KnockoutStageColumn[] | null {
    switch (teams.length) {
      case 24:
        return this.createRoundOf24Bracket(teams);
      case 16:
        return this.createStandardBracket(teams, [
          { key: 'roundOf16', label: this.stageLabels.roundOf16, matchCount: 8 },
          { key: 'quarterFinals', label: this.stageLabels.quarterFinals, matchCount: 4 },
          { key: 'semiFinals', label: this.stageLabels.semiFinals, matchCount: 2 },
          { key: 'final', label: this.stageLabels.final, matchCount: 1 },
        ]);
      case 8:
        return this.createStandardBracket(teams, [
          { key: 'quarterFinals', label: this.stageLabels.quarterFinals, matchCount: 4 },
          { key: 'semiFinals', label: this.stageLabels.semiFinals, matchCount: 2 },
          { key: 'final', label: this.stageLabels.final, matchCount: 1 },
        ]);
      case 4:
        return this.createStandardBracket(teams, [
          { key: 'semiFinals', label: this.stageLabels.semiFinals, matchCount: 2 },
          { key: 'final', label: this.stageLabels.final, matchCount: 1 },
        ]);
      default:
        return null;
    }
  }

  private buildSeededTeams(groups: TeamGroup[]): Team[] {
    const firstPlaced = groups
      .map((group) => group.teams[0])
      .filter((team): team is Team => !!team);

    const secondPlaced = groups
      .map((group) => group.teams[1])
      .filter((team): team is Team => !!team);

    return [...firstPlaced, ...secondPlaced];
  }

  private createRoundOf24Bracket(teams: Team[]): KnockoutStageColumn[] {
    const byeTeams = teams.slice(0, 8);
    const playInTeams = teams.slice(8);

    const roundOf24Matches = this.createSeededMatches(playInTeams, 'roundOf24');
    const roundOf16Matches = this.createEmptyMatches(8, 'roundOf16');
    const quarterFinalMatches = this.createEmptyMatches(4, 'quarterFinals');
    const semiFinalMatches = this.createEmptyMatches(2, 'semiFinals');
    const finalMatches = this.createEmptyMatches(1, 'final');

    roundOf16Matches.forEach((match, index) => {
      match.homeTeam = byeTeams[index] ?? null;
    });

    roundOf24Matches.forEach((match, index) => {
      match.nextMatchId = roundOf16Matches[index]?.id ?? null;
      match.nextSlot = 'away';
    });

    this.connectRounds(roundOf16Matches, quarterFinalMatches);
    this.connectRounds(quarterFinalMatches, semiFinalMatches);
    this.connectRounds(semiFinalMatches, finalMatches);

    return [
      { key: 'roundOf24', label: this.stageLabels.roundOf24, matches: roundOf24Matches },
      { key: 'roundOf16', label: this.stageLabels.roundOf16, matches: roundOf16Matches },
      { key: 'quarterFinals', label: this.stageLabels.quarterFinals, matches: quarterFinalMatches },
      { key: 'semiFinals', label: this.stageLabels.semiFinals, matches: semiFinalMatches },
      { key: 'final', label: this.stageLabels.final, matches: finalMatches },
    ];
  }

  private createStandardBracket(
    teams: Team[],
    definitions: StageDefinition[]
  ): KnockoutStageColumn[] {
    const stages = definitions.map((definition, index) => {
      const matches =
        index === 0
          ? this.createSeededMatches(teams, definition.key)
          : this.createEmptyMatches(definition.matchCount, definition.key);

      return {
        key: definition.key,
        label: definition.label,
        matches,
      };
    });

    for (let index = 0; index < stages.length - 1; index++) {
      this.connectRounds(stages[index].matches, stages[index + 1].matches);
    }

    return stages;
  }

  private createSeededMatches(teams: Team[], stage: KnockoutStageKey): KnockoutMatch[] {
    const totalMatches = Math.floor(teams.length / 2);

    return Array.from({ length: totalMatches }, (_, index) => ({
      id: `${stage}-${index + 1}`,
      stage,
      homeTeam: teams[index] ?? null,
      awayTeam: teams[teams.length - 1 - index] ?? null,
      winner: null,
      nextMatchId: null,
      nextSlot: null,
    }));
  }

  private createEmptyMatches(count: number, stage: KnockoutStageKey): KnockoutMatch[] {
    return Array.from({ length: count }, (_, index) => ({
      id: `${stage}-${index + 1}`,
      stage,
      homeTeam: null,
      awayTeam: null,
      winner: null,
      nextMatchId: null,
      nextSlot: null,
    }));
  }

  private connectRounds(currentRound: KnockoutMatch[], nextRound: KnockoutMatch[]): void {
    currentRound.forEach((match, index) => {
      const nextMatch = nextRound[Math.floor(index / 2)];

      match.nextMatchId = nextMatch?.id ?? null;
      match.nextSlot = index % 2 === 0 ? 'home' : 'away';
    });
  }

  private propagateForward(stages: KnockoutStageColumn[], match: KnockoutMatch): void {
    if (!match.nextMatchId || !match.nextSlot) {
      return;
    }

    const nextMatch = this.findMatch(stages, match.nextMatchId);
    if (!nextMatch) {
      return;
    }

    if (match.nextSlot === 'home') {
      nextMatch.homeTeam = match.winner;
    } else {
      nextMatch.awayTeam = match.winner;
    }

    const winnerStillValid =
      !!nextMatch.winner &&
      ((!!nextMatch.homeTeam && nextMatch.winner.name === nextMatch.homeTeam.name) ||
        (!!nextMatch.awayTeam && nextMatch.winner.name === nextMatch.awayTeam.name));

    if (!winnerStillValid) {
      nextMatch.winner = null;
    }

    this.propagateForward(stages, nextMatch);
  }

  private findMatch(stages: KnockoutStageColumn[], matchId: string): KnockoutMatch | null {
    for (const stage of stages) {
      const match = stage.matches.find((item) => item.id === matchId);
      if (match) {
        return match;
      }
    }

    return null;
  }

  private isTeamInMatch(match: KnockoutMatch, team: Team): boolean {
    return match.homeTeam?.name === team.name || match.awayTeam?.name === team.name;
  }

  private cloneStages(stages: KnockoutStageColumn[]): KnockoutStageColumn[] {
    return stages.map((stage) => ({
      ...stage,
      matches: stage.matches.map((match) => ({ ...match })),
    }));
  }

  private buildSideStages(side: 'left' | 'right'): KnockoutStageColumn[] {
    const nonFinalStages = this.stages().filter((stage) => stage.key !== 'final');

    const sideStages = nonFinalStages
      .map((stage) => {
        const midpoint = Math.ceil(stage.matches.length / 2);

        return {
          ...stage,
          matches: side === 'left' ? stage.matches.slice(0, midpoint) : stage.matches.slice(midpoint),
        };
      })
      .filter((stage) => stage.matches.length > 0);

    return side === 'right' ? [...sideStages].reverse() : sideStages;
  }

  private getBaseMatchCount(stages: KnockoutStageColumn[]): number {
    const counts = stages.map((stage) => stage.matches.length);
    return counts.length ? Math.max(...counts) : 1;
  }
}