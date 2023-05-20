import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SLoad, SNavigation, SPopup, SView, SText, SIcon, SHr } from 'servisofts-component';
import Model from '../../Model';

class index extends DPA.delete {
    constructor(props) {
        super(props, { Parent: Parent, });
    }
    $allowAccess() {
        return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    }
    $onDelete() {
        this.data.estado = 0;
        Parent.model.Action.editar({
            data: this.data,
            key_usuario: ""
        }).then((resp) => {
            SNavigation.goBack();
            SNavigation.goBack();
        }).catch(e => {
            console.error(e);

        })
    }


    $getData() {
        this.almacenes = Model.almacen.Action.getAllBy({ key_sucursal: this.pk })
        this.data = Parent.model.Action.getByKey(this.pk);
        if (!this.almacenes || !this.data) return null;
        return this.data;
    }

    $render() {
        if (!this.$getData()) {
            return <SLoad />
        }
        if (Object.values(this.almacenes).length > 0) {
            return <SView col={"xs-12"} center>
                <SHr height={30} />
                <SIcon name='Alert' fill={"transparent"} width={100} />
                <SText fontSize={18} justify>{`"¡Atención! No puedes eliminar esta sucursal porque aún hay almacenes asociados a él. Por favor, elimina primero los almacenes luego intenta eliminar la sucursal. Esto es necesario para garantizar la integridad de los datos y mantener la precisión de tu inventario. Si necesitas ayuda para realizar esta acción, por favor contacta con el equipo de soporte."`}</SText>
            </SView>
        }
        return super.$render()
    }
}
export default connect(index);