import { Competition } from "@/types";
import { bettors } from "./bettors";

const ligue1 : Competition = {
    id : 1,
    name : "Ligue 1 25-26",
    teams : [
    {
        name : "PSG",
        id : 1
    },
    {
        name : "Lyon",
        id : 2
    },
    {
        name : "Marseille",
        id : 3
    },
    {
        name : "Nantes",
        id : 4
    }
],
    matches : []
}
ligue1.matches = [
    {
        id : 11,
        home : ligue1.teams[0],
        away : ligue1.teams[1],
        date : "2026-02-11T19:00:00",
        result : {
            halfTime : {
                home : 1,
                away : 2
            },
            fullTime : {
                home : 2,
                away : 1
            },
            winner : ligue1.teams[0]
        },
    },
    {
        id : 12,
        home : ligue1.teams[1],
        away : ligue1.teams[2],
        date : "2026-02-11T19:00:00",
        result : {
            halfTime : {
                home : 2,
                away : 1
            },
            fullTime : {
                home : 1,
                away : 2
            },
            winner : ligue1.teams[1]
        }
    },
    {
        id : 13,
        home : ligue1.teams[2],
        away : ligue1.teams[3],
        date : "2026-02-11T19:00:00",
        result : {
            halfTime : {
                home : 2,
                away : 1
            },
            fullTime : {
                home : 1,
                away : 2
            },
            winner : ligue1.teams[2]
        }
    }
]
ligue1.bets = [
    {
    id : 111,
    bettor : bettors[0],
    match : ligue1.matches[0],
    result : {
        halfTime : {
            home : 1,
            away : 2
        },
        fullTime : {
            home : 2,
            away : 1
        },
        winner : ligue1.matches[0].home
    }
},
{
    id : 112,
    bettor : bettors[1],
    match : ligue1.matches[0],
    result : {
        halfTime : {
            home : 2,
            away : 1
        },
        fullTime : {
            home : 1,
            away : 2
        },
        winner : ligue1.matches[0].away
    }
},
{
    id : 113,
    bettor : bettors[2],
    match : ligue1.matches[0],
    result : {
        halfTime : {
            home : 2,
            away : 1
        },
        fullTime : {
            home : 1,
            away : 2
        },
        winner : ligue1.matches[0].away
    }
} 
]
ligue1.matches[0].bets = [...ligue1.bets]
const premierLeague : Competition = {
    id : 2,
    name : "Premier League 25-26",
    teams : [
        {
            name : "Liverpool",
            id : 1
        },
        {
            name : "Manchester City",
            id : 2
        },
        {
            name : "Manchester United",
            id : 3
        },
        {
            name : "Chelsea",
            id : 4
        },
        {
            name : "Arsenal",
            id : 5
        }
    ],
    matches : []
}
premierLeague.matches = [
    {
        id : 21,
        home : premierLeague.teams[0],
        away : premierLeague.teams[1],
        date : "2026-02-11T19:00:00",
        result : {
            halfTime : {
                home : 1,
                away : 2
            },
            fullTime : {
                home : 2,
                away : 1
            },
            winner : premierLeague.teams[0]
        }
    },
    {
        id : 22,
        home : premierLeague.teams[1],
        away : premierLeague.teams[2],
        date : "2026-02-11T19:00:00",
        result : {
            halfTime : {
                home : 2,
                away : 1
            },
            fullTime : {
                home : 1,
                away : 2
            },
            winner : premierLeague.teams[1]
        }
    },
    {
        id : 23,
        home : premierLeague.teams[2],
        away : premierLeague.teams[3],
        date : "2026-02-11T19:00:00",
        result : {
            halfTime : {
                home : 2,
                away : 1
            },
            fullTime : {
                home : 1,
                away : 2
            },
            winner : premierLeague.teams[2]
        }
    }
]

export const competitions : Competition[] = [ligue1, premierLeague]
