import { SAction } from "servisofts-model";
export default class Action extends SAction {

    setState(data: any) {
        this._dispatch({
            ...this.model.info,
            type: "setState",
            ...data,
        });
    }

    getState() {
        return this._getReducer()
    }

    setItem(key_item: any, data: any) {
        let dato = this.getState();
        if (data.cantidad <= 0) {
            delete dato.productos[key_item];
        } else {
            dato.productos[key_item] = data;
        }

        this.setState(dato)
    }
    removeItem(key_item: any) {
        let dato = this.getState();
        delete dato.productos[key_item];
        this.setState(dato)
    }

    removeAll() {
        let dato = this.getState();
        dato.productos = {}
        this.setState(dato)
        console.log(this.getState())
    }

}