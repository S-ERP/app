import DPA, { connect } from 'servisofts-page';
import { Parent } from ".."
import { SDate, SHr, SInput, SList, SLoad, SMath, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import { MenuPages } from 'servisofts-rn-roles_permisos';
import SCharts from 'servisofts-charts';

class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "key_usuario", "estado", "lat", "lng", "key_empresa"],
            // item: item
        });
        this.state = {
            fecha_inicio: new SDate().toString("yyyy-01-01"),
            fecha_fin: new SDate().toString("yyyy-MM-dd")
        }
    }
    componentDidMount() {
        Model.compra_venta.Action.getStates(this.pk, this.state.fecha_inicio, this.state.fecha_fin).then(e => {
            this.setState({ data: e.data });
        }).catch(e => {
            console.error(e);
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


    changeFecha(key, val) {
        this.state[key] = val;
        this.componentDidMount();
        this.setState({ ...this.state })
    }
    getChart() {
        if (!this.state.data) return <SLoad />

        return <SView col={"xs-12"} height={220} center>
            <SHr />
            <SView row col={"xs-12"}>
                <SView flex>
                    <SInput type='date' value={this.state.fecha_inicio} onChangeText={val => {
                        this.changeFecha("fecha_inicio", val)
                    }} />
                </SView>
                <SView flex>
                    <SInput type='date' value={this.state.fecha_fin} onChangeText={val => {
                        this.changeFecha("fecha_fin", val)
                    }} />
                </SView>
            </SView>
            <SView width={252} flex>
                <SCharts
                    type='barras_verticales'
                    config={{ grosor: 80, separacion: 8, }}
                    data={[
                        { key: "a", val: this.state.data["comprado"]?.sum ?? 0, label: "Compras", color: "#B144E5", info: "Bs." + SMath.formatMoney(this.state.data["comprado"]?.sum ?? 0, 0) },
                        { key: "b", val: this.state.data["vendido"]?.sum ?? 0, label: "Ventas", color: "#7DCC33", info: "Bs." + SMath.formatMoney(this.state.data["vendido"]?.sum ?? 0, 0) },
                        { key: "c", val: this.state.data["cobrado"]?.sum ?? 0, label: "Cobrado", color: "#C2CCF0", info: "Bs." + SMath.formatMoney(this.state.data["cobrado"]?.sum ?? 0, 0) },
                        // { key: "d", val: this.state.data["cotizacion"]?.sum ?? 0, label: "Cotizacion", color: "#FF66FF", info: SMath.formatMoney(this.state.data["cotizacion"]?.sum ?? 0) },
                    ]}
                    fill={STheme.color.card} />
            </SView>
        </SView>
    }
    $footer() {
        return <SView col={"xs-12"} >

            {this.getChart()}

            <SText fontSize={16} bold>Menu</SText>
            <SHr />
            <MenuPages path={"/sucursal/profile/"} permiso={"ver"} params={{
                pk: this.pk
            }}>
                {/* <MenuButtom label={"Permisos"} url={Parent.path + "/profile/permisos"} params={{ pk: this.pk }} icon={<SIcon name={"Ajustes"} />} /> */}
                {/* <MenuButtom label={"Datos"} url={Parent.path + "/profile/datos"} params={{ pk: this.pk }} icon={<SIcon name={"Ajustes"} />} /> */}
                {/* <MenuButtom label={"Datos"} url={Parent.path + "/profile/datos"} params={{ pk: this.pk }} icon={<SIcon name={"Ajustes"} />} /> */}
            </MenuPages>
        </SView>
    }
}
export default connect(index);