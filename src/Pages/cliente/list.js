import { SDate, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../Model';

class index extends DPA.list {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "fecha_on", "key_usuario", "Password", "Telefono", "Correo", "CI"],
            defaultParams: { key_rol: "51ee8a95-094b-41eb-8819-4afa1f349394" },
            params: ["key_rol"],
            onRefresh: (resolve) => {
                Model.usuario.Action.CLEAR();
                Model.usuarioRol.Action.CLEAR();
                resolve();
            }
        });
    }

    componentDidMount() {
        Model.compra_venta.Action.getClientes().then(resp => {
            this.setState({ data: resp.data })
            console.log(resp);
        }).catch(e => {
            console.error(e);
        })
    }
    $allowNew() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "new" });
    }
    $allowTable() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" });
    }
    $filter(data) {
        return data.estado != "0"
    }
    $getData() {
        var usuarios = Model.usuario.Action.getAll();
        if (!usuarios) return null;
        if (!this.state.data) return null;
        var obj_final = {};
        Object.values(this.state.data).map((obj) => {
            obj_final[obj.key_usuario] = {
                ...obj,
                ...usuarios[obj.key_usuario]
            };
        })
        return obj_final;
    }


    $item(data) {
        return <>
            {super.$item(data, {
                footer: () => {
                    return <SView col={"xs-12"} row>
                        <SView width={4} />
                        <SText color={STheme.color.gray} fontSize={12}>{"Ultima compra:"}</SText>
                        <SView width={8} />
                        <SText>{new SDate(data.ultima_compra).toString("yyyy-MM-dd")}</SText>
                    </SView>
                }
            })}

        </>
    }
}
export default connect(index);