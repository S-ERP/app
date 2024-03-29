import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SHr, SList, SList2, SLoad, SNavigation, SText, SView } from 'servisofts-component';
import Model from '../../Model';
import SSocket from 'servisofts-socket';
class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            params: ["onSelect?"],
            excludes: ["key", "key_usuario", "estado"],
            // item: item
        });
    }

    componentDidMount() {
        SSocket.sendPromise({
            component: "tarea_usuario",
            type: "getAll",
            key_tarea: this.pk,
            key_empresa: Model.empresa.Action.getKey()
        }).then(e => {
            this.setState({ tarea_usuario: e.data })
            console.log("Exito");
        }).catch(e => {
            console.log("error");
        })
    }
    $allowEdit() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
    }
    $allowDelete() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    }
    $getData() {
        return Parent.model.Action.getByKey(this.pk);
    }

    getLista() {
        if (!this.state.tarea_usuario) return <SLoad />
        return <SList
            data={this.state.tarea_usuario}
            filter={a => a.estado > 0}
            render={(a) => {
                let usuario = Model.usuario.Action.getByKey(a.key_usuario)
                return <SView card padding={8} onPress={(e) => {
                    a.estado = 0;
                    SSocket.sendPromise({
                        component: "tarea_usuario",
                        type: "editar",
                        data: a,
                        key_tarea: this.pk,
                        key_empresa: Model.empresa.Action.getKey(),
                        key_usuario: Model.usuario.Action.getKey()
                    }).then(e => {
                        this.setState({ ...this.state })
                        console.log("Exito");
                    }).catch(e => {
                        console.log("error");
                    })
                }}>
                    <SText>{usuario?.Nombres} {usuario?.Apellidos}</SText>
                    <SText>{usuario?.Correo}</SText>
                </SView>
            }}
        />
    }

    $footer() {
        return <SView col={"xs-12"}>
            <SHr />
            <SText padding={16} width={170} card onPress={() => {
                SNavigation.navigate("/usuario", {
                    onSelect: (e) => {
                        SSocket.sendPromise({
                            component: "tarea_usuario",
                            type: "registro",
                            key_tarea: this.pk,
                            key_empresa: Model.empresa.Action.getKey(),
                            key_usuario: Model.usuario.Action.getKey()
                        }).then(e => {
                            console.log("Exito");
                        }).catch(e => {
                            console.log("error");
                        })
                    }
                })
            }}>+ Agregar Usuarios</SText>
            <SHr />
            {this.getLista()}
        </SView>
    }
}
export default connect(index);