import { Injectable } from '@angular/core';
import { Team } from '../interfaces/team';

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

@Injectable({
  providedIn: 'root',
})

export class LocalStorageService {
  private readonly ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

  private getTeamsKey(tournamentId: number): string {
    return `teams_tournament_${tournamentId}`;
  }

  setTeams(tournamentId: number, teams: Team[]): void {
    const key = this.getTeamsKey(tournamentId);

    const entry: CacheEntry<Team[]> = {
      value: teams,
      expiresAt: Date.now() + this.ONE_MONTH_MS,
    };

    localStorage.setItem(key, JSON.stringify(entry));
  }

  getTeams(tournamentId: number): Team[] | null {
    const key = this.getTeamsKey(tournamentId);
    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
      return null;
    }

    try {
      const entry: CacheEntry<Team[]> = JSON.parse(rawValue);

      if (!entry?.value || !entry?.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      if (Date.now() > entry.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.value;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  removeTeams(tournamentId: number): void {
    localStorage.removeItem(this.getTeamsKey(tournamentId));
  }

  clearExpiredTeams(tournamentId: number): void {
    this.getTeams(tournamentId);
  }
}