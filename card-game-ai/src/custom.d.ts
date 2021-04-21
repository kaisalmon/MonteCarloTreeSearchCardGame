declare module 'csv-load-sync'{
    export function load<G>(path:string):G[]
}
declare module 'import-directory'{
    export default function importDir<T>(path:string):Record<string, T>;
}