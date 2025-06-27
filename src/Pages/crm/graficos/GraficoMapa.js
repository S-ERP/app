import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SMapView, STheme, SView } from 'servisofts-component';
export default class GraficoMapa extends Component {



    componentDidMount() {

        this.regions = {}
        const sc = require("./bolivia/santacruz.json");
        this.regions[sc.key] = sc;
        const lp = require("./bolivia/lapaz.json");
        this.regions[lp.key] = lp;
        const cb = require("./bolivia/cochabamba.json");
        this.regions[cb.key] = cb;
        const or = require("./bolivia/oruro.json");
        this.regions[or.key] = or;
        const pt = require("./bolivia/potosi.json");
        this.regions[pt.key] = pt;
        const ch = require("./bolivia/chuquisaca.json");
        this.regions[ch.key] = ch;
        const tr = require("./bolivia/tarija.json");
        this.regions[tr.key] = tr;
        const bn = require("./bolivia/beni.json");
        this.regions[bn.key] = bn;
        const pd = require("./bolivia/pando.json");
        this.regions[pd.key] = pd;
        this.forceUpdate();
    }
    render() {
        return <SView col={"xs-12"} flex >
            <SMapView
                initialRegion={{
                    latitude: -16.500000,
                    longitude: -64.119293,
                    latitudeDelta: 8,
                    longitudeDelta: 8
                }}
            >
                {this.regions && Object.values(this.regions).map((region) => {
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
                }
            </SMapView>
        </SView>
    }
}
