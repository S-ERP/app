import { STable2 } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import Model from '../../Model';

class index extends DPA.table {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "Password"],
            defaultParams: { key_rol: "51ee8a95-094b-41eb-8819-4afa1f349394" },
            params: ["key_rol"]
        });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "table" });
    }
    myheads = {};
    $getData() {
        var data = Parent.model.Action.getAll();
        var usuarioRol = Model.usuarioRol.Action.getAllByKeyRol(this.$params.key_rol)
        var usuario_Dato = Model.usuario_dato.Action.getAll();
        var datos = Model.dato.Action.getAll();
        if (!data || !usuarioRol || !usuario_Dato || !datos) return null;
        var dataFinal = {};

        Object.values(usuarioRol).map(ur => {
            if (data[ur.key_usuario]) {
                dataFinal[ur.key_usuario] = data[ur.key_usuario]
                var datos_del_usuario = Model.usuario_dato.Action.getAllBy({ key_usuario_perfil: ur.key_usuario });

                Object.values(datos_del_usuario).map(ddu => {
                    var dato = datos[ddu.key_dato];
                    dataFinal[ur.key_usuario][dato.descripcion] = ddu.descripcion;
                    this.myheads[dato.descripcion] = true;
                    // console.log(dato)
                })
                // console.log(datos_del_usuario);
            }
        })
        return dataFinal;
    }
    $filter(data) {
        return data.estado != 0
    }
    $headers() {
        var header = super.$headers();

        // var datos = Model.dato.Action.getAll();

        Object.keys(this.myheads).map((o) => {
            header[o] = {
                width: 120,
                label: o
            }
        })
        header["Nombres"] = {
            ...header["Nombres"],
            width: 120,
        }
        header["Apellidos"].width = 120;
        header["CI"].width = 100;
        header["Correo"].width = 220;
        header["Telefono"].width = 140;
        header["key-ver"] = { label: "ver", width: 50, render: () => "Ver", center: true }
        return header;
    }
}
export default connect(index);