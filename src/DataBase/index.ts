import SDB, { DBProps, TableAbstract } from 'servisofts-db'
import widget from './tables/widget'

const Tables = {
    widget
}

export const DB: DBProps = {
    db_name: "serp",
    version: 2,
    tables: Object.values(Tables)
}

export default {
    init: () => {
        return new Promise((resolve, reject) => {
            SDB.open(DB).then((e: any) => {
                console.log("ENTRO ACA")
                resolve("")
            })
        })
    },
    clear: () => {
        DB.tables.map(t => t.deleteAll())
    },
    ...Tables

}


