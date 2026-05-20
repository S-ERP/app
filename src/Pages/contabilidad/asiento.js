import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SInput, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { AsientoContable2 } from 'servisofts-rn-contabilidad';
import Container from '../../Components/Container';
import Model from '../../Model';
import MDL from '../../MDL';

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tags: {

            }
        };
        this.pk = SNavigation.getParam("pk")
        this.clone = SNavigation.getParam("clone")
        this.key_gestion = SNavigation.getParam("key_gestion", Model.gestion.Action.getSelect()?.key)
    }
    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: "/contabilidad/asiento", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        }).catch(e => {
            console.error(e);
        })
    }

    render() {
        return (
            <SPage title={"Asientos contables"} disableScroll center>
                <SView col={"xs-11.5 sm-10 md-8"} height>
                    <SHr />
                    <SView col={"xs-12"} row style={{
                        justifyContent: "space-between"
                    }}>
                        <ContactoSelect onChange={(cliente) => {
                            this.state.tags.key_cliente = cliente?.key
                            this.forceUpdate();
                        }} />
                        <DiarioSelect onChange={(diario) => {
                            this.state.key_diario = diario?.key
                            this.forceUpdate();
                        }} />
                    </SView>
                    <AsientoContable2 key_gestion={this.key_gestion} key_asiento_contable={this.pk} clone={this.clone} tipo_comprobante={this.state.tipo_comprobante} tags={this.state.tags} key_diario={this.state.key_diario} />
                </SView>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);


const ContactoSelect = ({ onChange }) => {
    const [data, setData] = React.useState([]);


    const loadData = async () => {
        const resp = await MDL.crm.cliente.getAll();
        setData(resp);
    }

    React.useEffect(() => {
        loadData();
    }, [])

    return <SInput label={"Contacto"}
        customStyle={"erp"}
        placeholder={"Selecciona un contacto"}
        type='select2'
        options={data.map(e => `${e.nombres}`)}
        onChangeText={(e) => {
            const cliente = data.find(a => a.nombres == e);
            onChange(cliente);
        }}
        style={{
            maxWidth: 200
        }}

    />
}
const DiarioSelect = ({ onChange }) => {
    const [data, setData] = React.useState([]);


    const loadData = async () => {
        const resp = await MDL.contabilidad.diario.getAll();
        setData(resp);
    }

    React.useEffect(() => {
        loadData();
    }, [])

    const toString = (obj) => {
        return `${obj.codigo} - ${obj.descripcion}`;
    }

    return <SInput label={"Diario"}
        customStyle={"erp"}
        placeholder={"Selecciona un diario"}
        type='select2'
        options={data.map(e => toString(e))}
        onChangeText={(txt) => {
            const obj = data.find(a => toString(a) == txt);
            onChange(obj);
        }}
        style={{
            maxWidth: 200
        }}

    />
}