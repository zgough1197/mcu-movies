import { question } from './utils/cli'
import { CharacterList } from "./types/lists"
import { Alias, Character, CharacterAliases, CharacterTeam, Order, RoleWeight } from "./types/types"
import { deleteFile, getFromFile, getOrdersFromFile, getRoleOrderFromFile, saveToFile } from "./utils/fileOps"
import { formatJsonForFile } from "./utils/utils"

interface Action {
    pos: string,
    text: string,
    perform: () => Promise<void>,
    returnValue: number,
    alts?: string[]
}

interface SporcleRow {
    hint: string,
    answer: string,
    extra: string
}

const quit = async (): Promise<void> => {
    return new Promise((resolve:() => void): void => {
        console.log('Quitting...')
        resolve()
    })
}

const saveFullCharacterInfo = async (): Promise<void> => {
    const charList = new CharacterList()

    const chars = await charList.get()
    await saveToFile('./data/outputs/fullCharacterInfo.json', formatJsonForFile(chars))
}

const generateNewAliases = async (): Promise<void> => {
    const charList = new CharacterList()

    const newAliases: CharacterAliases[] = []

    const chars = await charList.charactersWithNoAliases()
    chars.forEach(char => {
        newAliases.push({
            name: char.name,
            aliases: []
        })
    })
    await saveToFile('./data/emptyAliases.json', formatJsonForFile(newAliases))
}

const importNewAliases = async (): Promise<void> => {
    const newAliases: CharacterAliases[] = await getFromFile('./data/emptyAliases.json')
    const oldALiases: CharacterAliases[] = await getFromFile('./data/aliases.json')

    newAliases.forEach(a => {
        if (a.aliases.length > 0) {
            oldALiases.push(a)
        }
    })

    oldALiases.sort((a: CharacterAliases, b: CharacterAliases): number => {
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
    })

    await saveToFile('./data/aliases.json', formatJsonForFile(oldALiases))
    await deleteFile('./data/emptyAliases.json')
}

const getOrder = (orderReq: string, orders: Order[]): Order => {
    let out = orders[0]
    orders.forEach(o => {
        if(o.name === orderReq) out = o
    })
    return out
}

const getOrderVal = (n: string, o: Order): number => {
    let out: number = -1
    o.order.forEach((m: string, i: number) => {
        if (m === n) out = i
    })
    return out
}

const getRoleOrder = (role: string, roleOrder: RoleWeight[]): number => {
    let o: number = Infinity
    roleOrder.forEach(r => {
        if (r.name === role) {
            o = r.weight
        }
    })

    return o
}

const genCharsByMovie = async (): Promise<void> => {
    const orders = await getOrdersFromFile()
    const roleWeights = await getRoleOrderFromFile()

    const charList = new CharacterList()
    const chars: Character[] = await charList.get()

    const order: Order = getOrder('releaseOrder', orders)

    const rows: SporcleRow[] = []

    chars.forEach((c: Character) => {
        c.appearances.forEach(m => {
            let role = 'Recurring character'

            if (m.isStanLee) {
                role = "Cameo"
            } else if (m.inPostCredits) {
                role = 'Post Credits'
            } else if (m.isTitular) {
                role = 'Title character'
            } else if (m.isVillain) {
                role = 'Villain'
            } else if (c.teams && c.teams.length > 0) {
                let teams: CharacterTeam[] = c.teams.filter((t:CharacterTeam) => t.movie == null || t.movie === m.name).sort((a: CharacterTeam, b: CharacterTeam): number => {
                    return a.weight - b.weight
                })
                if(teams != null && teams.length > 0) {
                    role = teams[0].name
                }
            } else if (m.isMainCharacter) {
                role = 'Main character'
            } 

            rows.push({
                hint: m.name,
                answer: c.aliases.reduce((acc: string, curr: Alias) => {
                    if (curr.inMovie && curr.inMovie === m.name) {
                        return `${acc}/${curr.alias}`
                    }
                    return acc
                }, c.name),
                extra: role
            })
        })
    })

    rows.sort((a: SporcleRow, b: SporcleRow): number => {
        const aMovieOrder = getOrderVal(a.hint, order), bMovieOrder = getOrderVal(b.hint, order)
        if (aMovieOrder > bMovieOrder) return 1
        if (aMovieOrder < bMovieOrder) return -1

        const aRoleOrder = getRoleOrder(a.extra, roleWeights), bRoleOrder = getRoleOrder(b.extra, roleWeights)
        if (aRoleOrder > bRoleOrder) return 1
        if (aRoleOrder < bRoleOrder) return -1

        if (a.answer > b.answer) return 1
        if (a.answer < b.answer) return -1

        return 0
    })

    await saveToFile('./data/outputs/characterByMovie.txt',rows.map((r: SporcleRow) => `${r.hint}\t${r.answer}\t${r.extra}`).join('\n'))
}

const writeCharsByAppCount = async (): Promise<void> => {
    interface AppearanceCount {
        name: string,
        count: number
    }

    const charList = new CharacterList()
    const chars = await charList.get()

    const o: AppearanceCount[] = []

    chars.forEach(c => {
        o.push({
            name: c.name,
            count: c.appearances.length
        })
    })

    o.sort((a, b) => b.count - a.count)

    await saveToFile('./data/outputs/characterAppearanceCount.txt',o.reduce((acc: string, curr: AppearanceCount) => `${acc}${curr.name}: ${curr.count}\n`, ''))
}

const nullAction: Action = {
    pos: '-1',
    text: '',
    perform: (): Promise<void> => {
        return new Promise((resolve:() => void): void => {
            console.log('Did not find corresponding action, please enter a number corresponding to the desired action')
            resolve()
        })
    },
    returnValue: 1
}

const actionsList: Action[] = [
    {
        pos: '0',
        text: 'Quit',
        perform: quit,
        alts: [
            'quit',
            'q',
            'exit'
        ],
        returnValue: 0
    },
    {
        pos: '2',
        text: 'Generate list of characters without aliases into emptyAliases.json',
        perform: generateNewAliases,
        returnValue: 1
    },
    {
        pos: '1',
        text: 'Generate full list of characters with all info',
        perform: saveFullCharacterInfo,
        returnValue: 1
    },
    {
        pos: '3',
        text: 'Import updated character aliases from emptyAliases.json to aliases.json',
        perform: importNewAliases,
        returnValue: 1
    },
    {
        pos: '4',
        text: 'Generate sporcle data for characters by movie in release order',
        perform: genCharsByMovie,
        returnValue: 1
    },
    {
        pos: '5',
        text: 'Write characters by appearance count',
        perform: writeCharsByAppCount,
        returnValue: 1
    }
]

const getAction = (n: string): Action => {
    let r: Action | undefined = undefined
    actionsList.forEach((a: Action): void => {
        if (a.pos === n || a.alts?.includes(n) )
        {
            r = a
        }
    })
    return r != null ? r : nullAction
}

const forQuestion = (l: Action[]): string => {
    l.sort((a: Action, b: Action) => {
        let apos: number = Number(a.pos), bpos: number = Number(b.pos)
        if ((apos <= 0 && bpos <= 0) || (apos > 0 && bpos > 0)) {
            return apos - bpos
        } else if(apos <= 0) {
            return 1
        } else if(bpos <= 0) {
            return -1
        }
        return apos - bpos
    })
    return l.reduce((a: string, c: Action): string => {
        return `${a}\t${c.pos}: ${c.text}\n`
    },'')
}

export const performAction = async (): Promise<number> => {
    const a = await question(`Select an action:\n${forQuestion(actionsList)}`)
    let action: Action = getAction(a)
    action.perform()
    return action.returnValue
}