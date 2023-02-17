import { getAliasesFromFile, getMoviesFromFile, getTeamsFromFile } from "../utils/fileOps"
import { Character, CharacterAliases, CharacterAppearance, CharacterTeam, Movie, MovieAppearance, Team } from "./types"

const getExistingCharacterFromList = (list: Character[], name: string): Character | undefined => {
    let out: Character | undefined = undefined
    list.forEach(char => {
        if (char.name === name) {
            out = char
        }
    })
    return out
}

const getCharacterAliasesFromList = (list: CharacterAliases[], name: string): CharacterAliases | undefined => {
    let out: CharacterAliases | undefined = undefined
    list.forEach(charAliases => {
        if (charAliases.name === name) {
            out = charAliases
        }
    })
    return out
}

export class CharacterList {
    private chars: Character[] = []
    private state: string = 'New'

    constructor() {
        this.load()
    }

    async load(): Promise<void> {
        const addGeneralAliases = (char: Character, aliasList: string[] | undefined): void => {
            if (aliasList == null) {
                return
            }
    
            aliasList.forEach((alias) => {
                let found = false
                char.aliases.forEach((existingAlias) => {
    
                })
                if (!found) {
                    char.aliases.push({
                        alias: alias
                    })
                }
            })
        }

        const addMovieSpecificAliases = (c: Character, m: Movie): void => {
            m.specialAliases?.forEach(a => {
                if (a.name === c.name) {
                    c.aliases.push({
                        alias: a.alias,
                        inMovie: m.name
                    })
                }
            })
        }

        const addAppearance = (c: Character, m: Movie, charAppearance: CharacterAppearance): void => {
            c.appearances.push({
                name: m.name,
                isTitular: charAppearance.isTitular || false,
                isVillain: charAppearance.isVillain || false,
                inPostCredits: charAppearance.inPostCredits || false,
                isMainCharacter: charAppearance.isMainCharacter || false,
                isStanLee: charAppearance.isStanLee || false
            })
        }

        const addTeams = (c: Character, teams: Team[]): void => {
            teams.forEach(t => {
                if(t.members.includes(c.name)){
                    if (c.teams == null) c.teams = []
                    let ct: CharacterTeam = {
                        name: t.name,
                        weight: t.weight
                    }
                    if (t.movie) ct.movie = t.movie
                    c.teams?.push(ct)
                }
            })
        }

        this.state = 'Loading'
        return getMoviesFromFile().then((movies: Movie[]) => {
            getAliasesFromFile().then((aliases: CharacterAliases[]) => {
                getTeamsFromFile().then((teams: Team[]) => {
                    movies.forEach((movie: Movie) => {
                        movie.appearances.forEach((charAppearance: CharacterAppearance) => {
                            let c: Character | undefined = getExistingCharacterFromList(this.chars, charAppearance.name)
                            if(c == null) {
                                c = {
                                    name: charAppearance.name,
                                    aliases: [],
                                    appearances: []
                                }
                                const charAliases: CharacterAliases | undefined = getCharacterAliasesFromList(aliases, charAppearance.name)
                                addGeneralAliases(c, charAliases?.aliases)
                                addTeams(c, teams)
                                addAppearance(c, movie, charAppearance)
                                addMovieSpecificAliases(c, movie)
                                this.chars.push(c)
                            } else {
                                addAppearance(c, movie, charAppearance)
                                addMovieSpecificAliases(c, movie)
                            }
                        })
                    })
                    this.state = 'Ready'
                })
            })
        })
    }

    private async waitForReadyState(): Promise<void> {
        return new Promise((resolve: () => void) => {
            if(this.state === 'Ready') {
                resolve()
            }

            const polling = setInterval(() => {
                if(this.state === 'Ready') {
                    clearInterval(polling)
                    resolve()
                }
            }, 100)
        })
    }

    get(): Promise<Character[]> {
        return this.waitForReadyState().then(() => {
            return this.chars
        })
    }

    test(): Promise<void> {
        return new Promise((resolve) => {
            console.log('CharacterListTest')
            resolve()
        })
    }

    charactersWithNoAliases(): Promise<Character[]> {
        return this.waitForReadyState().then(() => {
            const o = this.chars.filter((c: Character) => {
                return c.aliases.length === 0
            })
            return o
        })
    }
}