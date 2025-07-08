import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SPage, SText, SMapView } from 'servisofts-component';

const JSONRuta = require("./spain/gadm41_ESP_1.json");
export default class ImportadorGADM extends Component {


    componentDidMount() {
        this.importar();
    }

    regions;
    async importar() {
        const feactures = JSONRuta.features;
        const regiones = {};
        feactures.map((feacture) => {
            const region = {
                name: feacture.properties.NAME_1,
                country: feacture.properties.COUNTRY,
                key: feacture.properties.HASC_1.toLowerCase(),
                HASC: feacture.properties.HASC_1,
                color: "#FFD700",
                colors: ["#007A33", "#FFD700"],
            }
            if (feacture.geometry.type == "Polygon") {
                region.coordinates = [feacture.geometry.coordinates[0]];
            } else if (feacture.geometry.type == "MultiPolygon") {
                region.coordinates = feacture.geometry.coordinates.map((coor) => coor[0]);
            }
            regiones[region.key] = region;
        })
        this.regions = regiones;
        this.forceUpdate();
        console.log(JSONRuta)
    }

    renderPolilynes() {
        if (!this.regions) return;
        const arrFinal = [];
        Object.values(this.regions).map((region) => {
            region.coordinates.map((coordinates, index) => (
                arrFinal.push({
                    region: region,
                    coord: coordinates.map(coord => ({
                        latitude: coord[1],
                        longitude: coord[0]
                    }))
                }
                )
            ));
        })
        return arrFinal.map((co, index) => {
            const isSelected = this.state?.select == co.region.key;
            return <SMapView.SPolygon
                key={`${co.region.key}-${index}`}
                onPress={e => {
                    console.log("onPress", co.region.key, co.region.name);
                    this.setState({ select: co.region.key })
                }}
                coordinates={co.coord}
                fillColor={co.region.color}
                fillOpacity={isSelected ? 0.9 : 0.1}
                strokeWidth={0.5}
                // strokeOpacity={0.5}
                strokeColor={"#ffffff"}
            />
        });
    }
    render() {


        return <SPage title={"Importador GADM"} disableScroll flex>
            <SMapView
                initialRegion={{
                    // iniciar en espana
                    latitude: 40.4637,
                    longitude: -3.7492,
                    latitudeDelta: 8,
                    longitudeDelta: 8
                }}
            >
                <></>
                {this.regions && this.renderPolilynes()}
                {/* {this.regions && Object.values(this.regions).map((region) => {
                    const color = region.color
                    const isSelected = this.state?.select == region.key;
                    return <SMapView.SPolygon
                        onPress={e => {
                            this.setState({ select: region.key })
                        }}
                        coordinates={region.coordinates}
                        fillColor={color}
                        fillOpacity={isSelected ? 0.9 : 0.1}
                        strokeWidth={1}
                        // strokeOpacity={0.5}
                        strokeColor={"#ffffff"}
                    />
                })
                } */}


            </SMapView>
        </SPage>
    }
}
