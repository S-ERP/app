import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SHr, SIcon, SLoad, SNavigation, SPopup, SText, SView } from 'servisofts-component';
import Model from '../../../Model';

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
        this.productos = Model.producto.Action.getAllBy({ key_almacen: this.pk })
        this.data = Parent.model.Action.getByKey(this.pk);
        if (!this.productos || !this.data) return null;
        return this.data;
    }

    $render() {
        if (!this.$getData()) {
            return <SLoad />
        }
        if (Object.values(this.productos).length > 0) {
            return <SView col={"xs-12"} center>
                <SHr height={30} />
                <SIcon name='Alert' fill={"transparent"} width={100} />
                <SText fontSize={18} justify>{`"¡Atención! No puedes eliminar este almacén porque aún hay productos asociados a él. Por favor, mueve primero los productos a otro almacén disponible y luego intenta eliminar el almacén. Esto es necesario para garantizar la integridad de los datos y mantener la precisión de tu inventario. Si necesitas ayuda para realizar esta acción, por favor contacta con el equipo de soporte."`}</SText>
            </SView>
        }
        return super.$render()
    }
}
export default connect(index);