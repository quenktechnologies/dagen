
declare module 'docopt' {

    export interface Arguments {

        [key: string]: string

    }

    export function docopt<A>(s: string, context?: Arguments): A

}
