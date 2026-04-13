import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, EventEmitter, Output, HostListener } from '@angular/core';
import { Team, TeamGroup } from '../../../../interfaces/team';
import { TournamentService } from '../../../../services/tournament-service';

@Component({
  selector: 'app-selecting-teams-page',
  imports: [CommonModule],
  templateUrl: './selecting-teams-page.html',
  styleUrl: './selecting-teams-page.css',
})
export class SelectingTeamsPage {
  private readonly tournamentService = inject(TournamentService);

  readonly allTeams = computed(() => this.tournamentService.allTeams());
  readonly numberOfTeams = computed(() => this.tournamentService.numberOfTeams());

  readonly groupSize = 4;

  groups = signal<TeamGroup[]>([]);
  availableTeams = signal<Team[]>([]);
  @Output() nextStep = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  openDropdownKey = signal<string | null>(null);
  searchTerms = signal<Record<string, string>>({});

  constructor() {
    const teams = this.allTeams();
    const teamCount = this.numberOfTeams();

    this.initializeGroups(teams, teamCount);
  }

  back(){
    this.goBack.emit();
  }

  private initializeGroups(teams: Team[], teamCount: number | null): void {
    if (!teamCount || !teams.length) {
      this.groups.set([]);
      this.availableTeams.set([]);
      return;
    }

    const groupCount = Math.ceil(teamCount / this.groupSize);

    const groups: TeamGroup[] = Array.from({ length: groupCount }, (_, index) => ({
      name: `Group ${String.fromCharCode(65 + index)}`,
      teams: Array(this.groupSize).fill(null),
    }));

    this.groups.set(groups);
    this.availableTeams.set(this.sortTeams([...teams]));
  }

  getSelectedValue(team: Team | null): string {
    return team?.name ?? '';
  }

  getSlotKey(groupIndex: number, slotIndex: number): string {
    return `${groupIndex}-${slotIndex}`;
  }

  isDropdownOpen(groupIndex: number, slotIndex: number): boolean {
    return this.openDropdownKey() === this.getSlotKey(groupIndex, slotIndex);
  }

  openDropdown(groupIndex: number, slotIndex: number): void {
    this.openDropdownKey.set(this.getSlotKey(groupIndex, slotIndex));
  }

  closeDropdown(): void {
    this.openDropdownKey.set(null);
  }

  toggleDropdown(groupIndex: number, slotIndex: number): void {
    const key = this.getSlotKey(groupIndex, slotIndex);
    this.openDropdownKey.set(this.openDropdownKey() === key ? null : key);
  }

  setSearchTerm(groupIndex: number, slotIndex: number, value: string): void {
    const key = this.getSlotKey(groupIndex, slotIndex);
    this.searchTerms.update(current => ({
      ...current,
      [key]: value,
    }));
  }

  getSearchTerm(groupIndex: number, slotIndex: number): string {
    return this.searchTerms()[this.getSlotKey(groupIndex, slotIndex)] ?? '';
  }

  clearSearchTerm(groupIndex: number, slotIndex: number): void {
    const key = this.getSlotKey(groupIndex, slotIndex);
    this.searchTerms.update(current => ({
      ...current,
      [key]: '',
    }));
  }

  getAvailableTeamsForSlot(currentTeam: Team | null): Team[] {
    const available = this.availableTeams();

    if (!currentTeam) {
      return this.sortTeams([...available]);
    }

    return this.sortTeams([...available, currentTeam]);
  }

  getFilteredTeamsForSlot( groupIndex: number, slotIndex: number, currentTeam: Team | null ): Team[] {
    const searchTerm = this.getSearchTerm(groupIndex, slotIndex).trim().toLowerCase();
    const teams = this.getAvailableTeamsForSlot(currentTeam);

    if (!searchTerm) {
      return teams;
    }

    return teams.filter(team => team.name.toLowerCase().includes(searchTerm));
  }

  selectTeam(groupIndex: number, slotIndex: number, selectedTeam: Team): void {
    const nextGroups = this.groups().map(group => ({
      ...group,
      teams: [...group.teams],
    }));

    const nextAvailableTeams = [...this.availableTeams()];
    const previousTeam = nextGroups[groupIndex].teams[slotIndex];

    if (previousTeam) {
      nextAvailableTeams.push(previousTeam);
    }

    nextGroups[groupIndex].teams[slotIndex] = selectedTeam;

    const filteredAvailableTeams = nextAvailableTeams.filter(
      team => team.name !== selectedTeam.name
    );

    this.groups.set(nextGroups);
    this.availableTeams.set(this.sortTeams(filteredAvailableTeams));
    this.clearSearchTerm(groupIndex, slotIndex);
    this.closeDropdown();
  }

  removeTeam(groupIndex: number, slotIndex: number): void {
    const nextGroups = this.groups().map(group => ({
      ...group,
      teams: [...group.teams],
    }));

    const team = nextGroups[groupIndex].teams[slotIndex];
    if (!team) {
      return;
    }

    nextGroups[groupIndex].teams[slotIndex] = null;

    this.groups.set(nextGroups);
    this.availableTeams.set(this.sortTeams([...this.availableTeams(), team]));
    this.clearSearchTerm(groupIndex, slotIndex);
  }

  autoDraw(): void {
    const allTeams = this.allTeams();
    const teamCount = this.numberOfTeams();

    if (!teamCount || !allTeams.length) {
      return;
    }

    const shuffledTeams = this.shuffleArray([...allTeams]).slice(0, teamCount);

    const nextGroups = this.groups().map(group => ({
      ...group,
      teams: Array(this.groupSize).fill(null),
    }));

    shuffledTeams.forEach((team, index) => {
      const groupIndex = Math.floor(index / this.groupSize);
      const slotIndex = index % this.groupSize;

      if (nextGroups[groupIndex]) {
        nextGroups[groupIndex].teams[slotIndex] = team;
      }
    });

    const usedNames = new Set(shuffledTeams.map(team => team.name));
    const remainingTeams = allTeams.filter(team => !usedNames.has(team.name));

    this.groups.set(nextGroups);
    this.availableTeams.set(this.sortTeams(remainingTeams));
    this.searchTerms.set({});
    this.closeDropdown();
  }

  isReadyToContinue(): boolean {
    return this.groups().every(group =>
      group.teams.every(team => team !== null)
    );
  }

  onContinue(): void {
    if (!this.isReadyToContinue()) {
      return;
    }

    this.tournamentService.setGroupStageTeams(this.groups());
    this.nextStep.emit();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeDropdown();
  }

  trackTeam(_: number, team: Team): string {
    return team.name;
  }

  private sortTeams(teams: Team[]): Team[] {
    return teams.sort((a, b) => a.name.localeCompare(b.name));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];

    for (let index = copy.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }

    return copy;
  }
}