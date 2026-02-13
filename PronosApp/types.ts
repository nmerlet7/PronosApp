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
}

export type Match = {
    id? : number,
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
}

export type Score = {
    home : number,
    away : number,
}

export type Bettor = {
    id? : number,
    name : string,
}

export type Bet = {
    id? : number,
    bettor: Bettor,
    match : Match,
    result : Result,
}
