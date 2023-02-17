import { Character, CharacterList } from "../types/lists"
import { CharacterAliases } from "../types/types"
import { saveToFile } from "../utils/fileOps"
import { formatJsonForFile } from "../utils/utils"

const charList = new CharacterList()

export const generateNewAliases = (): Promise<void> => {
    const newAliases: CharacterAliases[] = []

    return charList.charactersWithNoAliases().then((chars: Character[]) => {
        chars.forEach(char => {
            newAliases.push({
                name: char.name,
                aliases: []
            })
        })

        return saveToFile('./data/emptyAliases.json', formatJsonForFile(newAliases))
    })
}

export const importNewAliases = (): Promise<void> => {
    return new Promise((resolve) => {
        resolve()
    })
}