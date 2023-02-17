import { performAction } from "./actions"

const main = async (): Promise<void> => {
    let result = await performAction()
    if(result === 1) {
        main()
    } else {
        process.exit()
    }
}

main()