import { SReducer } from "servisofts-model";

export default class Reducer extends SReducer {

    onLike(state: any, action: any): void {
        if (!state.data) return;
        if (!state.data[action.key_publicacion]) return;
        state.data[action.key_publicacion].mylike = action.cantidad;
        state.data[action.key_publicacion].likes += action.cantidad;
    }

    dislike(state: any, action: any): void {
        if (!state.data) return;
        if (!state.data[action.key_publicacion]) return;
        let cantidad = state.data[action.key_publicacion].mylike;
        state.data[action.key_publicacion].mylike = 0;
        state.data[action.key_publicacion].likes -= cantidad;
    }


}