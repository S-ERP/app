import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SDate, SNavigation, SNotification, SPopup, STheme, SThread } from 'servisofts-component';
import Model from '../../Model';

class index extends DPA.edit {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: []
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }
    $inputs() {
        var inp = super.$inputs();
        inp["observacion"].type = "textArea";
        let sdate = new SDate(this.data.fecha_on);
        inp["_fecha"] = { type: "date", label: "Fecha", defaultValue: sdate.toString("yyyy-MM-dd") }
        inp["_hora"] = { type: "hour", label: "Hora", defaultValue: sdate.toString("hh:mm") }
        return inp;
    }
    $onSubmit(data) {
        new SThread(1000, "esperarFoto", false).start(() => {
            let fecha = new SDate(data["_fecha"] + " " + data["_hora"], "yyyy-MM-dd hh:mm")
            // Parent.model.Action.editarCompraVenta({
            Parent.model.Action.editar({
                data: {
                    ...this.data,
                    ...data,
                    fecha_on: fecha.toString()
                },
                key_usuario: Model.usuario.Action.getKey()
            }).then((resp) => {
                SNavigation.goBack();
            }).catch(e => {
                SNotification.send({
                    title: "Error al generar comprobante.",
                    body: e.error,
                    color: STheme.color.danger,
                    time: 10000
                })

            })
        })

    }
}

export default connect(index);