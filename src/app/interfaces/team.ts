export interface Team {
  name: string;
  logo: string;
}

export interface TeamGroup {
  name: string;
  teams: (Team | null)[];
}