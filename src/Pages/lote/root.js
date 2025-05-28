//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SButtom, SPage, SText, SView } from 'servisofts-component';
import { SMapView } from 'servisofts-component';

import customMapStyle from './customMapStyle'
import SSocket from 'servisofts-socket';
import Model from '../../Model';

// create a component
class index extends Component {

    state = {
        lotes: []
    };

    componentDidMount() {
        SSocket.sendPromise({
            component: "terreno",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey()
        }).then(e => {
            this.setState({ lotes: Object.values(e.data) ?? [] })
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }
    polilineRepaint() {
        return this.state.lotes.map((lote) => {
            if (!lote.points) return null;
            return <SMapView.SPolygon coordinates={lote.points} strokeColor='#000' fillOpacity={0.5} fillColor='#000' strokeWidth={1} />
        });

    }

    markerRepaint() {
        return this.state.points.map((point) => {
            return <SMapView.SMarker latitude={point.latitude} longitude={point.longitude} />
        });
    }

    pressLote(event) {
        console.log(event);
        if (this.state.lotes.length <= 0) {
            this.state.lotes.push({ points: [] });
        }
        this.state.lotes[this.state.lotes.length - 1].points.push(event.coordinate)
        this.setState({ ...this.state })
    }

    crearLote() {
        this.state.lotes.push({ points: [] })
        this.setState({ ...this.state })
    }

    eliminarLote(index, lote) {
        const lotes = [...this.state.lotes]; // Hacemos una copia del array
        lotes.splice(index, 1); // Eliminamos el elemento en la posición 'index'
        this.setState({ lotes }); // Actualizamos el estado con el nuevo array
        if (lote) {
            SSocket.sendPromise({
                component: "terreno",
                type: "editar",
                key_empresa: Model.empresa.Action.getKey(),
                data: {
                    ...lote,
                    estado: 0
                }
            }).then(e => {
                // this.setState({ lotes: Object.values(e.data) })
                console.log(e);
            }).catch(e => {
                console.error(e);
            })
        }

    }

    verLote(points) {
        // mover el mapa a donde esta el lote
        this.map.fitToCoordinates(points, { edgePadding: { top: -0.005, right: -0.005, bottom: -0.005, left: -0.005 } })
    }
    guardarLote(lote) {
        // mover el mapa a donde esta el lote
        SSocket.sendPromise({
            component: "terreno",
            type: "registro",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            data: {
                key_empresa: Model.empresa.Action.getKey(),
                key_usuario: Model.usuario.Action.getKey(),
                points: lote.points,
            }
        }).then(e => {
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }

    lotesRepaint() {
        return <SView col={"xs-12"} row >
            {
                this.state.lotes.map((lote, index) => {
                    return <SView margin={5} padding={5} border={1} borderRadius={10}>
                        <SView>
                            <SText>Lote {index + 1}</SText>
                        </SView>

                        <SButtom onPress={this.verLote.bind(this, lote.points)} type='success' style={{ height: 20 }}>Ver</SButtom>
                        <SButtom onPress={this.guardarLote.bind(this, lote)} type='success' style={{ height: 20 }}>GUARDAR</SButtom>
                        <SButtom onPress={this.eliminarLote.bind(this, index, lote)} type='danger' style={{ height: 20 }}>Eliminar</SButtom>


                    </SView>
                })
            }
        </SView>
    }

    render() {
        return (
            <SPage title={"Lote"}>
                <SMapView ref={ref => this.map = ref} initialRegion={{
                    latitude: -17.783799,
                    longitude: -63.180,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1
                }} customMapStyle={customMapStyle}
                    onPress={this.pressLote.bind(this)}
                >
                    {this.polilineRepaint()}
                </SMapView>
                <SView card height={150}>
                    <SButtom type='danger' style={{ height: 20 }} onPress={() => {
                        this.crearLote()
                    }}>Crear Lote</SButtom>
                    {this.lotesRepaint()}

                </SView>
            </SPage>
        );
    }
}


//make this component available to the app
export default index;
