import { createInterface } from 'readline/promises'
import { stdin, stdout } from 'process'

const rl = createInterface(stdin, stdout)

export const question = async (str: string): Promise<string> => {
    return rl.question(str)
}