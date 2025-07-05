import React, { Component } from 'react';
import { View, Text, Switch } from 'react-native';
import { SHr, SIcon, SInput, SText, STheme, SView } from 'servisofts-component';
import TurnoComponent, { HorarioItem } from '.';
import SIconApp from '../../Assets/SIconApp';
import eliminados from '../../Pages/usuario/eliminados';

type HoraItemProps = {
    horario: HorarioItem,
    dia: any,
    onDelete?: () => void
}
export default class HoraItem extends Component<HoraItemProps> {

    render() {
        return <>
            <SView col={"xs-12"} height={70} center border={STheme.color.card}   >
                <SView col={"xs-11.5"} center row >
                    <SView col={"xs-5"} center>
                        <SInput label={"Hora inicio"} style={{ height: 32, fontSize: 12, }}
                            type="hour" value={this.props.horario.hora_inicio}
                            onChangeText={e => {
                                this.props.horario.hora_inicio = e;
                                this.forceUpdate();
                            }}
                            iconR={<SIcon name='history' width={14} style={{ paddingRight: 4, }} fill='#666' />}
                        />
                    </SView>
                    <SView flex />
                    <SView col={"xs-5"} center border={"transparent"} >
                        <SInput label={"Hora fin"} type="hour" style={{ height: 32, fontSize: 12, }}
                            value={this.props.horario.hora_fin}
                            onChangeText={e => {
                                this.props.horario.hora_fin = e;
                                this.forceUpdate();
                            }}
                            iconR={<SIcon name='history' width={14} style={{ paddingRight: 4, }} fill='#666' />}
                        />
                    </SView>
                    <SView flex />
                    <SView col={"xs-1"} center border={"transparent"} style={{ paddingTop: 28 }}  >
                        <SView width={40} height={40} center border={STheme.color.card}
                            onPress={() => {
                                if (this.props.onDelete) {
                                    this.props.onDelete();
                                }
                                this.forceUpdate();
                            }}
                        >
                            <SIcon name="crmeliminar" stroke='red' width={20} />
                        </SView>
                    </SView>
                </SView>
                <SHr height={20} />
            </SView>
        </>

    }
}
