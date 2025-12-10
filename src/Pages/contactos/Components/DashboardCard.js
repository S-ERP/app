import React, { Component } from 'react';
import { SDate, SHr, SIcon, SImage, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Etiqueta from './Etiqueta';
import SIconApp from '../../../Assets/SIconApp';
import MDL from '../../../MDL';
import FloatMenu from '../../../Components/FloatMenu';
import FormRegistroCliente from '../../crm/Components/FormRegistroCliente';
import AdminsitrarHabilidades from '../../cliente/Components/AdministrarHabilidades';

export default class DashboardCard extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const card = this.props.data;
        const data_tipo_stage = this.props.data_stage;
        const tipo_contacto = card.tipo_cliente?.filter(a => a.key === data_tipo_stage.key)[0] ?? null;
        const fecha = card.fecha_edit ?? card.fecha_on;

        return (
            <SView style={{ backgroundColor: STheme.color.background + "66", borderColor: STheme.color.card, borderWidth: 1, minHeight: 70, padding: 8, borderRadius: 8, cursor: "grab", }} row

                onPress={(e) => {
                    console.log("AQUI", e)
                    // const { row, evt } = e;
                    const menuOptions = [
                        // {
                        //     label: 'Llamar',
                        //     icon: <SIconApp name="tareaclose" fill="#e4e4e4ff" width={16} />,
                        //     onPress: () => {
                        //         alert("trabajandolo")
                        //     },
                        // },
                        {
                            label: 'Editar Contacto',
                            icon: <SIconApp name="Pencil" fill="#e4e4e4ff" width={16} />,
                            onPress: () => {
                                // alert("trabajandolo")
                                FormRegistroCliente.open({
                                    defaultData: card,
                                    onActualizar: (nuevoDato) => {
                                        // this.DinamicTable.loadData();
                                        this.props.onLoadData(); // ✅ PROP NUEVA PARA RECARGAR
                                        console.log("Cliente actualizado:", nuevoDato);
                                    }
                                });
                            },
                        },
                        {
                            label: 'Eliminar Contacto',
                            icon: <SIconApp name="crmeliminar" fill={STheme.color.danger} width={16} />,
                            onPress: () => {

                                SPopup.confirm({
                                    title: (
                                        <SView center style={{
                                            textAlign: 'center',
                                            gap: 16,
                                            paddingTop: 18,
                                            paddingBottom: 14,
                                            paddingHorizontal: 20
                                        }}>
                                            <SView col="xs-12" row style={{
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: 8
                                            }}>
                                                <SView flex> <SText style={{ fontSize: 18, fontWeight: 'bold', color: STheme.color.text }}> Eliminar Contacto </SText> </SView>

                                                <SView> <SIconApp name="Cerrar" width={10} fill="#9ca3af" onPress={() => SPopup.close('confirm')} /> </SView>
                                            </SView>
                                            <SView style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(220, 38, 38, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                                <SIconApp name="AlertOutline" width={24} fill="#dc2626" />
                                            </SView>
                                            <SView style={{ marginBottom: 4 }}> <SText style={{ fontSize: 16, color: STheme.color.text, textAlign: 'center' }}> ¿Estás seguro de que deseas eliminar a </SText> </SView>
                                            <SView style={{ marginBottom: 8 }}> <SText style={{ fontSize: 18, fontWeight: 'bold', color: STheme.color.text, textAlign: 'center' }}> {card.nombres} </SText> </SView>
                                            <SText style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}> Esta acción no se podrá deshacer </SText>
                                        </SView>
                                    ),
                                    onPress: () => {
                                        MDL.crm.tipoCliente.deleteClienteDeLaTabla(tipo_contacto.key_cliente_tipo_cliente)
                                            .then(() => {
                                                this.props.onRemoveCliente(tipo_contacto.key_cliente_tipo_cliente);
                                                SNotification.send({
                                                    title: `✅ "${card.nombres}" quitado`,
                                                    color: STheme.color.success,
                                                    time: 1500
                                                });
                                            })
                                            .catch(err => {
                                                SNotification.send({
                                                    title: "❌ Error al quitar",
                                                    body: err,
                                                    color: STheme.color.danger
                                                });
                                            });
                                    }

                                });

                            },
                        },

                        {
                            label: "Administrar Habilidades",
                            icon: <SIcon name="Engranaje" fill={STheme.color.text} />,
                            // icon: "Add",
                            onPress: () => {
                                AdminsitrarHabilidades.open({
                                    key_usuario: card.key,
                                    onSuccess: (e) => {
                                        if (this.props.refresh) this.props.refresh()
                                        // if(!card.habilidades) card.habilidades = [];
                                        // card.habilidades.push(e)
                                        // this.forceUpdate();
                                        // this.DinamicTable.loadData();
                                    }
                                });
                                // console.log("AQUIiii", this.state.data);
                                // RolesDelUsuario.open({
                                //     data: e.row,
                                //     keyUsers: this.keyUsers,
                                //     // data: this.keyUsers,
                                //     onRegister: (e) => {
                                //         console.log("QUEEE", e)
                                //         this.table.loadData();
                                //     }
                                // })

                            }
                        }
                    ];

                    FloatMenu.open({ e: e, label: 'Opciones Contacto - ' + card?.nombres, options: menuOptions, });
                }} >
                <SView row col={"xs-2"} center >
                    <SView style={{ width: 30, height: 30, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card, }}>
                        <SImage
                            src={SSocket.api.root + "usuario/" + card.key}
                            style={{ resizeMode: "cover" }}
                        />
                    </SView>
                </SView>
                <SView row col={"xs-10"}>
                    <SView row col={"xs-12"}>
                        <SHr h={4} />
                        <SText bold >{card?.nombres}</SText>
                        <SView width={8} />
                        <SText fontSize={14} underLine style={{ marginTop: -1 }}
                            color={STheme.color.link}
                            onPress={() => {
                                // SNavigation.navigate("/crm/plantilla", { key: card.key })
                                // SNavigation.navigate("/crm/call", { key: card.key })
                            }}
                        >{card?.telefono}</SText>
                        <SHr h={4} />
                        <SText fontSize={10} color={STheme.color.lightGray}>{card?.tipo}</SText>
                        <SText fontSize={10} color={STheme.color.lightGray} >{tipo_contacto?.titulo}</SText>
                    </SView>
                </SView>
                <SHr h={5} />
                <SView col={"xs-12"} style={{
                    borderBottomColor: STheme.color.card,
                    borderBottomWidth: 1,
                }} />
                <SHr h={10} />
                <SView row col={"xs-12"} >
                    <Etiqueta
                        tipo_leads={card.state}
                        size={10}
                        style={{
                            padding: 0,
                            height: 18,
                            justifyContent: 'center',
                            marginRight: 4,
                            marginBottom: 4
                        }}
                    />
                    {card?.departamento && (
                        <SView style={{
                            padding: 3,
                            backgroundColor: STheme.colorFromText(card.departamento) + "6b",
                            borderRadius: 4,
                            marginRight: 4,
                            marginBottom: 4
                        }} center>
                            <SText style={{ maxWidth: 90 }}
                                fontSize={10}
                                numberOfLines={1}
                                color={STheme.color.lightGray}
                            >
                                {card.departamento}
                            </SText>
                        </SView>
                    )}
                    <SView row style={{
                        padding: 3,
                        backgroundColor: STheme.color.card,
                        borderRadius: 4,
                        marginRight: 4,
                        marginBottom: 4
                    }} center>
                        <SIcon name="history" width={12} height={14} fill={STheme.color.lightGray} />
                        <SView width={4} />
                        <SText style={{ maxWidth: 90 }}
                            fontSize={10}
                            numberOfLines={1}
                            color={STheme.color.lightGray}
                        >
                            Hace {new SDate(fecha, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())}
                        </SText>
                    </SView>
                </SView>
                {card.habilidades && (card.habilidades ?? []).map((habilidad) => (
                    <SView row style={{
                        padding: 3,
                        backgroundColor: STheme.colorFromText(habilidad.descripcion) + "6b",
                        borderWidth: 1,
                        borderColor: STheme.colorFromText(habilidad.descripcion),
                        borderRadius: 4,
                        marginRight: 4,
                        marginBottom: 4
                    }} center>
                        <SText style={{ maxWidth: 90 }}
                            fontSize={10}
                            numberOfLines={1}
                            color={STheme.color.lightGray}
                        >
                            {habilidad.descripcion}
                        </SText>
                    </SView>
                ))}
            </SView>
        );
    }
}