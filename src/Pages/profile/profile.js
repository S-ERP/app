import DPA, { connect } from 'servisofts-page';
import { SButtom, SHr, SImage, SInput, SList, SLoad, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
import { EditarUsuarioRol, EditarUsuarioRolEmpresa } from 'servisofts-rn-roles_permisos';
import { Parent } from './index';
import SSocket from 'servisofts-socket';
class index extends DPA.profile {
    constructor(props) {
        super(props, {
            Parent: Parent,
            excludes: ["key", "Password"],
            defaultParams: {
                "pk": Model.usuario.Action.getKey()
            },
        });
        this.pk = Model.usuario.Action.getKey();
        this.$params.pk = this.pk;
    }

    $allowEdit() {
        return true;
    }
    // $allowDelete() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "delete" })
    // }
    // $allowAccess() {
    //     return Model.usuarioPage.Action.getPermiso({ url: Parent.path, permiso: "ver" })
    // }

    $getData() {
        return Parent.model.Action.getByKey(this.$params["pk"]);
    }
    renderEmpresa = (key_usuario) => {
        let arr = Model.empresa_usuario.Action.getAllByKeyUsuario(key_usuario);
        if (!arr) return <SLoad />
        return <SView col={"xs-12"} center>
            <SList
                data={arr}
                render={(a) => {
                    return <SView col={"xs-12"} card padding={8} row>
                        <SView width={40} height={40} card>
                            <SImage src={Model.empresa._get_image_download_path(SSocket.api, a?.empresa?.key)} />
                        </SView>
                        <SView width={8} />
                        <SView flex>
                            <SText bold fontSize={16}>{a?.empresa?.razon_social}</SText>
                            <SText color={STheme.color.gray}>{a?.empresa?.nit}</SText>
                            <SHr />
                            <SText >Tu alias: {a?.alias}</SText>
                        </SView>
                    </SView>
                }}
            />
        </SView>

    }
    $footer() {

        return <SView col={"xs-12"} center>
            <SHr />
            <SButtom type={'outline'} onPress={() => {
                Model.usuario.Action.unlogin();
            }}>Cerrar sesión</SButtom>
            <SHr h={50} />
            <SText col={"xs-12"} fontSize={18}>Mis empresa</SText>
            {this.renderEmpresa(this.$params["pk"])}
            <SHr h={50} />
            <EditarUsuarioRol key_usuario={this.$params["pk"]} disabled onlyActives />
            <SHr h={50} />
            <EditarUsuarioRolEmpresa key_usuario={this.$params["pk"]} key_empresa={Model.empresa.Action.getSelect()?.key} disabled onlyActives />
        </SView>

    }
}
export default connect(index);