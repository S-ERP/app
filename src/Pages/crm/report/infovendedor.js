import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification, SImage, SDate } from 'servisofts-component';
import FileChooser from '../../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../Config';
import SCharts from 'servisofts-charts';
import Usuarios from 'servisofts-component/img/Usuarios';
import Model from '../../../Model';
import { version } from 'process';
import TarjetaVendedor from '../Components/TarjetaVendedor';


export default class infovendedor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            fecha_inicio: new SDate().toString("yyyy-MM-dd"),
            fecha_fin: new SDate().toString("yyyy-MM-dd"),
        };
    }


    handleFechaChange = (key, value) => {
        this.setState({ [key]: value }, this.cargar);
    };


    componentDidMount() {
        this.cargar();
    }
    cargar = () => {
        const { fecha_inicio, fecha_fin } = this.state;
        if (!fecha_inicio || !fecha_fin) return;

        const key_usuario = Model.usuario.Action.getUsuarioLog()?.key;

        MDL.crm.reporte._get_usuarios_states_total(fecha_inicio + "T00:00:00", fecha_fin + "T23:59:59")
            .then(data => {
                MDL.usuario.getByKeys(Object.keys(data)).then((usuarios) => {
                    const nd = {};
                    Object.keys(data).forEach(k => {
                        if (k !== key_usuario) return;
                        const obj = data[k];
                        const user = usuarios.find(a => a.key == k);
                        if (user) nd[user.Nombres] = obj;
                    });
                    this.setState({ data: nd });
                    console.log("Datos filtrados:", nd);
                });
            })
            .catch(err => {
                console.error("Error cargando datos:", err);
            });
    };



    render() {
        const { data, fecha_inicio, fecha_fin } = this.state;
        if (!fecha_inicio || !fecha_fin) return;

        const key_usuario = Model.usuario.Action.getUsuarioLog()?.key;

        // console.log("datos ", JSON.stringify(data))
        console.log("datos ", key_usuario)



        return (
            <SPage title="Informacion vendedor" disableScroll center row >
                <SHr height={32} />
                <SView col={"xs-12"} row center>

                    <SView col={"xs-11 md-5"} row backgroundColor='transparent'>
                        <SView col={"xs-12"} height={50} center row  >
                            <SView col={"xs-5"} backgroundColor='transparent'>
                                <SInput
                                    type="date" placeholder="Fecha Inicio" label={"Fecha Inicio"} style={{ width: "100%", borderRadius: 4, backgroundColor: STheme.color.card, }}
                                    iconR={<SIcon name='Evento' width={28} fill='#666' />} defaultValue={fecha_inicio} onChangeText={(val) => this.handleFechaChange("fecha_inicio", val)}
                                />
                            </SView>

                            <SView flex />
                            <SView col={"xs-5"} >
                                <SInput
                                    type="date" placeholder="Fecha Fin" label={"Fecha Fin"} style={{ width: "100%", borderRadius: 4, backgroundColor: STheme.color.card, }}
                                    iconR={<SIcon name='Evento' width={28} fill='#666' />} defaultValue={fecha_fin} onChangeText={(val) => this.handleFechaChange("fecha_fin", val)}
                                />
                            </SView>
                        </SView>
                    </SView>
                </SView>

                <SHr height={80} />

                <SView col={"xs-10"} flex>
                    {/* <TarjetaVendedor   /> */}
                    <TarjetaVendedor data={data} />
                </SView>
            </SPage >
        );
    }
}