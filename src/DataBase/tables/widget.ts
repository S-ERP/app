import SDB, { DBProps, Scheme, TableAbstract } from 'servisofts-db'
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { SDate } from 'servisofts-component';


export default new class widget extends TableAbstract {
    sync(): Promise<any> {
        throw new Error('Method not implemented.');
    }
    loadToReducer(): Promise<any> {
        throw new Error('Method not implemented.');
    }

    scheme: Scheme = {
        name: "widget",
        primaryKey: "key",
        properties: {
            sync_type: "string?",
            key: "string",
            fecha_on: "date?",
            estado: "int?",
            key_servicio: "string?",
            key_usuario: "string?",
            key_empresa: "string?",
            key_page: "string?",
            type: "string?",
            data: "json?",
            descripcion: "string?",
            url: "string?",
            x: "double?",
            y: "double?",
            w: "double?",
            h: "double?",
            index: "int?",

        }
    }
   
}();
