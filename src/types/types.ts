export interface CharacterTeam {
    name: string,
    weight: number,
    movie?: string
}

export interface Character {
    name: string,
    aliases: Alias[],
    appearances: MovieAppearance[],
    teams?: CharacterTeam[],
    actor?: string
}

export interface Alias {
    alias: string,
    inMovie?: string
}

export interface CharacterAliases {
    name: string,
    aliases: string[]
}

export interface CharacterSpecialAlias {
    name: string,
    alias: string
}

export interface MovieAppearance {
    name: string,
    isTitular?: boolean,
    isVillain?: boolean,
    isMainCharacter?: boolean,
    isStanLee?: boolean,
    inPostCredits?: boolean
}

export interface CharacterAppearance {
    name: string,
    isTitular?: boolean,
    isVillain?: boolean,
    isMainCharacter?: boolean,
    isStanLee?: boolean,
    inPostCredits?: boolean
}

export interface Movie {
    name: string,
    appearances: CharacterAppearance[],
    specialAliases?: CharacterSpecialAlias[]
}

export interface Team {
    name: string,
    members: string[],
    weight: number,
    movie?: string
}

export interface Order {
    name: string,
    order: string[]
}

export interface RoleWeight {
    name: string,
    weight: number
}