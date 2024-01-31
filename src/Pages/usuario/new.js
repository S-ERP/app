import DPA, { connect } from 'servisofts-page';
import { Parent } from '.';
import { SButtom, SNavigation, SPopup, SView } from 'servisofts-component';
import Model from '../../Model';
import DatosDocumentosEditar from './Components/DatosDocumentosEditar';

class index extends DPA.new {
    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["key_rol?", "onSelect?"],
            excludes: ["key", "fecha_on", "key_usuario", "estado"]
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" })
    }
    $inputs() {
        var inputs = super.$inputs();
        inputs["Password"].type = "password"
        inputs["Correo"].type = "email"
        // inputs["Telefono"].type = "phone"
        inputs["rep_pass"] = { label: "Rep. Password", type: "password", required: true }
        return inputs;
    }
    $submitName() {
        return ""
    }
    $onSubmit(data) {
        if (data["Password"] != data["rep_pass"]) {
            SPopup.alert("Las contraceñas no coinciden.")
            return;
        }
        Parent.model.Action.registro({
            data: data,
            key_rol: this._params.key_rol,
            key_usuario: ""
        }).then((resp) => {
            this.$submitFile(resp.data.key);
            if (this._params.key_rol) {
                Model.usuarioRol.Action.registro({
                    data: {
                        key_rol: this.$params.key_rol,
                        key_usuario: resp.data.key,
                    },
                    key_usuario: Model.usuario.Action.getKey()
                }).then((tesp) => {
                    if (this.presolve) {
                        this.presolve({
                            key_usuario: resp.data.key, callback: () => {
                                if (this._params.onSelect) {
                                    this._params.onSelect(resp.data);
                                    SNavigation.goBack();
                                    return;
                                } else {
                                    SNavigation.replace("/usuario/profile", { pk: resp.data.key })
                                }

                            }
                        })
                        // 
                    }
                }).catch((e) => {
                    this.reject("Error desconocido al asignar roles al usuario.");
                })
            } else {
                if (this._params.onSelect) {
                    this._params.onSelect(resp.data);
                    SNavigation.goBack();
                    return;
                }

            }

            // SNavigation.replace("/usuario/profile", { pk: resp.data.key });
        }).catch(e => {
            SPopup.alert("Ya existe un usuario con el dato, " + e.error_dato)
            console.error(e);

        })
    }

    $footer() {
        if (!this._params.key_rol) return <SView col={"xs-12"} center>
            <SButtom type='danger'>Confirmar</SButtom>
        </SView>;
        return <DatosDocumentosEditar key_rol={this._params.key_rol} onSubmit={() => {
            return new Promise((resolve, reject) => {
                this.presolve = resolve;
                this.reject = reject;
                if (!this.form.submit()) {
                    reject("Error en los datos del usuario")
                }
                // resolve("KEY_USUARIO");
            })
        }} />
    }

}

export default connect(index);