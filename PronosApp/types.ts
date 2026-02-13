export type Competition = {
    id? : number,
    name : string,
    teams : Team[],
    matches : Match[],
    bets? : Bet[],
    ranking? : Record<number, Bettor>,
}

export type Team = {
    id? : number,
    name : string,
    image? : string,
}

export type Match = {
    id? : number,
    name? : string,
    home : Team,
    away : Team,
    date : Date | string | null,
    result? : Result,
    bets? : Bet[],
}

export type Result = {
    winner? : Team,
    halfTime? : Score,
    fullTime? : Score,
    afterPenalties? : Score,
}

export type Score = {
    home : number,
    away : number,
}

export type Bettor = {
    id? : number,
    name : string,
    photo? : string,
    totalPoints? : number,
}

export type Bet = {
    id? : number,
    bettor: Bettor,
    match : Match,
    result : Result,
    points?: number,
    isLocked?: boolean,
}

export type RankingEntry = {
    bettor: Bettor,
    points: number,
    position: number,
}

export type PointsBreakdown = {
    winnerCorrect: number,
    halfTimeScoreCorrect: number,
    fullTimeScoreCorrect: number,
    halfTimeGoalsPenalty: number,
    fullTimeGoalsPenalty: number,
    total: number,
}
