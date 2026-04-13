import { Team, TeamGroup } from "./team";

export interface TournamentFlowState {
  tournament: {
    id: number | null;
    title: string | null;
  };
  numberOfTeams: number | null;
  allTeams: Team[];
  groupStageTeams: TeamGroup[];
  knockoutStageTeams: TeamGroup[];
}

export interface TournamentCard {
  id: number;
  title: string;
  description: string;
  icon: string;
  active: boolean;
}