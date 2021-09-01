import LocalStoragePersister from './stockPriceRetrieval/localStoragePersister'

export const stockPriceAppUrlBase = 'http://localhost:3000'

// Prepare a "state persister" (we'll use localStorage here but it could easily be a
// database stored elsewhere in a real app that records changes made to selections)..
export const statePersister = new LocalStoragePersister()
