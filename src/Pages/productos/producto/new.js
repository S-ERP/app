import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SInput, SLoad, SNavigation, SPopup, SText, SView } from 'servisofts-component';
import Model from '../../../Model';
import DatosDocumentosEditar from './Components/DatosDocumentosEditar';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "key_servicio", "estado"]
        });
        this.onSelect = SNavigation.getParam("onSelect")
    }
    $inputs() {
        var inp = super.$inputs();

        inp["descripcion"].editable = true
        inp["precio_compra"].type = "money"
        inp["precio_venta"].type = "money"
        inp["precio_venta_credito"].type = "money"
        inp["key_modelo"] = {
            ...inp["key_modelo"],
            editable: false,
            value: this.state?.modelo?.key,
            render: (ref) => {
                var value = ref.getValue();
                if (!value) {
                    return null;
                }
                return <SView col={"xs-12"} height center style={{ padding: 8 }}>
                    <SText col={"xs-12"}>{this.state.modelo.descripcion}</SText>
                </SView>
            },
            onPress: () => {
                SNavigation.navigate("/productos/modelo", {
                    onSelect: (item) => {
                        this.setState({ modelo: item })
                    }
                })
            }
        }
        return inp;
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $submitName() {
        return "";
    }
    $onSubmit(data) {
        Parent.model.Action.registro({
            data: data,
            key_almacen: this._params.key_almacen,
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            this.$submitFile(resp.data.key);

            if (this.presolve) {
                this.presolve({
                    key: resp.data.key,
                    callback: () => {
                        if (this.onSelect) {
                            if (this.key_last == resp.data.key) {
                                return;
                            }
                            this.key_last = resp.data.key
                            this.onSelect(resp.data);
                            return;
                        }
                        SNavigation.navigate("/productos/producto/profile", { pk: this.pk })

                    }
                })
                return;
                // this.presolve(resp.data.key);
                // SNavigation.replace("/cliente/profile", { pk: resp.data.key })
            }
            this.reject("Error desconocido al registrar")
            // SNavigation.goBack();
        }).catch(e => {
            this.reject("Error desconocido al registrar")

        })
    }
    $footer() {
        return <DatosDocumentosEditar key_tipo_producto={this.state?.modelo?.key_tipo_producto} onSubmit={() => {
            return new Promise((resolve, reject) => {
                this.presolve = resolve;
                this.reject = reject;
                if (!this.form.submit()) {
                    reject("Error en los datos")
                }
                // resolve("KEY_USUARIO");
            })
        }} />
    }
}

export default connect(index);