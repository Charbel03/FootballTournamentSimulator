import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { Team } from '../interfaces/team';
import { ClubTeamsResponse } from '../interfaces/club-team';

@Injectable({
  providedIn: 'root',
})
export class ClubTeamService {
  private apiUrl = 'https://www.thesportsdb.com/api/v1/json/123';

  constructor(private http: HttpClient) {}

  private getTeamsByLeague(league: string): Observable<Team[]> {
    return this.http
      .get<ClubTeamsResponse>(`${this.apiUrl}/search_all_teams.php?l=${league}`)
      .pipe(
        map((response) =>
          (response.teams ?? []).map((team) => ({
            name: team.strTeam,
            logo: team.strBadge,
          }))
        )
      );
  }

  getPremierLeagueTeams(): Observable<Team[]> {
    return this.getTeamsByLeague('English_Premier_League');
  }

  getLaLigaTeams(): Observable<Team[]> {
    return this.getTeamsByLeague('Spanish_La_Liga');
  }

  getSerieATeams(): Observable<Team[]> {
    return this.getTeamsByLeague('Italian_Serie_A');
  }

  getBundesligaTeams(): Observable<Team[]> {
    return this.getTeamsByLeague('German_Bundesliga');
  }

  getLigue1Teams(): Observable<Team[]> {
    return this.getTeamsByLeague('French_Ligue_1');
  }

  getAllTopLeagueTeams(): Observable<Team[]> {
    return forkJoin([
      this.getPremierLeagueTeams(),
      this.getLaLigaTeams(),
      this.getSerieATeams(),
      this.getBundesligaTeams(),
      this.getLigue1Teams(),
    ]).pipe(
      map(([premier, laliga, serieA, bundesliga, ligue1]) => [
        ...premier,
        ...laliga,
        ...serieA,
        ...bundesliga,
        ...ligue1,
      ])
    );
  }
}