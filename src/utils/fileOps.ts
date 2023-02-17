import { readFile, writeFile, unlink } from 'node:fs/promises'
import { CharacterAliases, Movie, Order, RoleWeight, Team } from '../types/types'

export const getFromFile = (filename: string): Promise<any> => {
  return readFile(filename,'utf8').then(d => JSON.parse(d))
}

export const saveToFile = (filename: string, data: string): Promise<void> => {
  return writeFile(filename, data, 'utf8')
}

export const deleteFile = async (filename: string): Promise<void> => {
    unlink(filename)
}

export const getMoviesFromFile = (): Promise<Movie[]> => {
    return getFromFile('data/movies.json')
}

export const getAliasesFromFile = (): Promise<CharacterAliases[]> => {
    return getFromFile('data/aliases.json')
}

export const getTeamsFromFile = (): Promise<Team[]> => {
    return getFromFile('data/teams.json')
}

export const getOrdersFromFile = (): Promise<Order[]> => {
    return getFromFile('data/order.json')
}

export const getRoleOrderFromFile = (): Promise<RoleWeight[]> => {
    return getFromFile('data/roleOrder.json')
}