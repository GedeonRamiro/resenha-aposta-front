export interface IDataGame {
  awayScore: number | null;
  secondLegAwayScore: number | null;
  penaltyAwayScore: number | null;
  awayTeam: string;
  awayTeamLogo: string | null;
  betCloseAt: string;
  competition: string | null;
  createdAt: string;
  gameType: string;
  gameDate: string;
  homeScore: number | null;
  secondLegHomeScore: number | null;
  penaltyHomeScore: number | null;
  homeTeam: string;
  homeTeamId: string | null;
  homeTeamLogo: string | null;
  id: string;
  moreInfo: string | null;
  relatedKnockoutGames?: IDataGame[];
  status: string;
  awayTeamId: string | null;
  competitionId: string | null;
  updatedAt: string;
}

export interface IDataBet {
  id: string;
  userId: string;
  gameId: string;
  option: string;
  isCorrect: boolean | null;
  pointsAwarded: number;
  settledAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastEditedAt: string | null;
  game: IDataGame;
  user: IDataUser;
}

export interface IDataUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  provider: string | null;
  providerId: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserScore {
  user: IDataUser;
  bets: number;
  points: number;
}

export interface IPagination {
  count: number;
  totalBets?: number;
  currentPage: number;
  nextPage: number | null;
  lastPage: number | null;
  prevPage: number | null;
}
