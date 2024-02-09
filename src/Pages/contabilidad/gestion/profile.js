import { SHr, SIcon, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import DPA, { connect } from 'servisofts-page';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';
import { Parent } from "."
import Model from '../../../Model';
import ListaAsientos from './Components/listaAsientos';
import item from "./item";
class index extends DPA.profile {
  constructor(props) {
    super(props, {
      Parent: Parent,
      item: item,
      excludes: ["key", "key_usuario", "key_servicio", "key_sucursal"],

    });
  }
  // $allowEdit() {
  //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "edit" })
  // }
  $allowDelete() {
      return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
  }
  $allowAccess() {
    return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
  }
  $getData() {
    return Parent.model.Action.getByKey(this.pk);
  }


  $menu() {
    let menu = super.$menu();

    let data = this.$getData();

    if (this.data?.estado === 2) {
      menu.push({
        label: <SText color={STheme.color.danger}>CERRAR</SText>, onPress: () => {
          SPopup.confirm({
            title: "¿Estás seguro de cerrar esta gestión?",
            message: "Antes de continuar, queremos informarte que al cerrar esta gestión, se abrirá automáticamente la gestión más reciente disponible. En caso de que esta sea la gestión más reciente, se abrirá una nueva en el siguiente mes. No te preocupes, todos tus comprobantes y registros están seguros y disponibles en la gestión correspondiente. ¿Deseas continuar?",
            onPress: () => {
              Model.gestion.Action.cerrar().then(resp => {
                // this.setState({ loading: false, error: "" })
                Model.gestion.Action.CLEAR();
                SNavigation.replace("/contabilidad/gestion/profile", { pk: resp?.data?.key })
              }).catch(e => {
                // this.setState({ loading: false, error: e.error })
              })
            }
          })
        }
      })
    } else if (this.data?.estado === 1) {
      menu.push({
        label: <SText color={STheme.color.success}>ABRIR</SText>, onPress: () => {
          SPopup.confirm({
            title: "¿Estás seguro de abrir esta gestión?",
            message: "Antes de continuar, queremos informarte que al abrir esta gestión, la que está actualmente abierta se cerrará automáticamente. Sin embargo, no te preocupes, todos los comprobantes que generes a partir de ahora se registrarán en esta gestión que estás abriendo. ¿Deseas continuar?",
            onPress: () => {
              Model.gestion.Action.abrir({ key_gestion: this.data.key }).then(resp => {
                Model.gestion.Action.CLEAR();
              }).catch(e => {
                console.log(e)
              })
            }
          })
        }
      })
    }
    if (data?.estado == 2) {
      menu.push({
        label: "Crear asiento", onPress: () => {
          SNavigation.navigate("/contabilidad/asiento")
        }
      })
    }
    return menu;
  }
  $footer() {
    return <SView col={"xs-12"} center>
      <SHr />
      <ListaAsientos key_gestion={this.pk} />
      {/* <MenuPages path={"/contabilidad/gestion/profile/"} >
                <MenuButtom label={"Asientos"} icon={<SIcon name='Add' />}
                    onPress={() => { SNavigation.navigate("/contabilidad/asiento_contable", { key_gestion: this.pk }) }}
                />
            </MenuPages> */}
      {/* <SText>Ver asientos</SText> */}
    </SView>
  }
}
export default connect(index);