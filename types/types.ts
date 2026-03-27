export interface IDataGame {
  awayScore: number | null;
  awayTeam: string;
  betCloseAt: string;
  competition: string | null;
  createdAt: string;
  gameDate: string;
  homeScore: number | null;
  homeTeam: string;
  id: string;
  moreInfo: string | null;
  status: string;
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
  currentPage: number;
  nextPage: number | null;
  lastPage: number | null;
  prevPage: number | null;
}
