import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import SSocket from 'servisofts-socket';
import { SNavigation, SPopup } from 'servisofts-component';
import Model from '../../../Model';

import PButtom from '../../../Components/PButtom';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["key_restaurante"],
            excludes: ["key", "fecha_on", "key_usuario", "estado", "key_restaurante", "habilitado", "fecha_habilitacion_automatica", "descuento_monto", "descuento_porcentaje"]
        });

        this.state = {
            categoria_producto: null,
            loading: false
        };
    }

    $allowAccess() {
        // return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
        return true;
    }

    $inputs() {
        var inp = super.$inputs();
        inp["precio"].type = "money"

        inp["image_profile"].label = "Inserte la Imagen del Producto:"

        inp["mayor_edad"].type = "select"
        inp["mayor_edad"].defaultValue = "Añadir si cree conveniente"
        inp["mayor_edad"].options = [{ key: "", content: "SELECCIONAR" }, { key: "true", content: "SI" }, { key: "false", content: "NO" }]

        inp["ley_seca"].type = "select"
        inp["ley_seca"].defaultValue = "Añadir si cree conveniente"
        inp["ley_seca"].options = [{ key: "", content: "SELECCIONAR" }, { key: "true", content: "SI" }, { key: "false", content: "NO" }]

        inp["key_categoria_producto"].editable = false;
        inp["key_categoria_producto"].onPress = (val) => {
            SNavigation.navigate("/restaurante/categoria_producto/list", {
                key_restaurante: this.$params.key_restaurante, onSelect: (val) => {
                    this.setState({ categoria_producto: val })
                }
            })
        }

        inp["key_categoria_producto"].value = this.state.categoria_producto ? this.state.categoria_producto.nombre : null;

        return inp;
    }

    $submitName() {
        return null
    }

    $onSubmit(data) {
        this.setState({ loading: true });

        data.habilitado = false;
        let defaulSelect = "Añadir si cree conveniente";

        if (data.ley_seca == "true" && (data.mayor_edad == "false" || data.mayor_edad == defaulSelect)) {
            SPopup.alert("No puede seleccionar ley seca si el producto no es para mayor de edad.");
            return;
        }

        if (this.$params.key_restaurante) {
            data.key_restaurante = this.$params.key_restaurante;
        } else {
            SPopup.alert("No hay Key Restaurante, reportar ese error.")
            return;
        }

        if (data.precio <= 0) {
            SPopup.alert("El producto no puede tener un precio menor o igual a 0")
            return;
        }

        if (data.mayor_edad == defaulSelect) { data.mayor_edad = "false" };

        if (data.ley_seca == defaulSelect) { data.ley_seca = "false" };

        if (!this.state.categoria_producto?.key) {
            this.setState({ loading: false });
            return SPopup.alert("Seleccione una categoria");
        }
        data.key_categoria_producto = this.state.categoria_producto.key;

        Parent.model.Action.registro({
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
        }).then((resp) => {

            this.form.uploadFiles(
                SSocket.api.root + "upload/producto/" + resp.data.key
            );

            SNavigation.navigate("/restaurante/producto", { key_restaura: this.$params.key_restaurante });
        }).catch(e => {
            SPopup.alert("Error en el server: " + e.error)
            console.error(e);
            this.setState({ loading: false });
        })
    }

    $footer() {
        return <PButtom
            danger={true}
            loading={this.state.loading}
            fontSize={20}
            onPress={() => { this.form.submit() }}
        >
            Crear Producto
        </PButtom>
    }
}

export default connect(index);