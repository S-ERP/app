import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SButtom, SHr, SInput, SLoad, SText, STheme, SView } from 'servisofts-component';
import * as xlsx from 'xlsx';
import SSocket from 'servisofts-socket'
import Producto from './Producto'

export default class ReaderExcelRuddy extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };

        this._ref = {};
        
    }

    async onChangeValue(files) {
        const file = files[0].file;
        const reader = new FileReader();
        const ele = this;
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = xlsx.read(data, { type: 'array', cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            let json = xlsx.utils.sheet_to_json(sheet);
            
            
            let productos = [];
            let marcas = {};
            let modelos = {};
            let colores = {};
            let anos = {};
            let index;
            for(let i = 0; i<json.length; i++){

                if(json[i]["MARCA:"]){
                    productos.push(json[i]);
                    index = productos.length-1;
                    if(!marcas[json[i]["MARCA:"]]) marcas[json[i]["MARCA:"]] = true;
                }
                if(json[i]["MODELO:"]){
                    if(!modelos[json[i]["MODELO:"]]) modelos[json[i]["MODELO:"]] = true;
                }
                if(json[i]["COLOR:"]){
                    if(!colores[json[i]["COLOR:"]]) colores[json[i]["COLOR:"]] = true;
                }
                if(json[i]["AÑO:"]){
                    if(!anos[json[i]["AÑO:"]]) anos[json[i]["AÑO:"]] = true;
                }

                
                if(!productos[index]["cuotas"]) productos[index]["cuotas"] = [];
                productos[index]["cuotas"].push(json[i]);
                
            }

            let obj = {};
            obj["productos"] = productos;
            obj["marcas"] = marcas;
            obj["modelos"] = modelos;
            obj["colores"] = colores;
            obj["anos"] = anos;

            ele.setState(obj);
        };
        reader.readAsArrayBuffer(file);
        return <SLoad />
    }


 

    repaint(){
        if(!this.state.productos){
            return <>
                <SText center fontSize={12}>A continuacion suba su excel de migracion</SText>
                <SHr height={10}/>
                <SInput type={"file"} onChangeText={this.onChangeValue.bind(this)} />
                <SHr height={20}/>
            </>
        }
        if(this.state.productos){
            return <>
                <SView backgroundColor={STheme.color.card} center padding={10} >
                    <SText padding={15} fontSize={20} color='#fff'>Se analizo su archivo excel se encontraron:</SText>
                    <SText padding={15} fontSize={20} color='#fff'>{Object.keys(this.state.marcas).length} marcas.</SText>
                    <SView flex row>
                    {
                        
                        Object.keys(this.state.marcas).map((marca)=>{
                            return <SText border={1} padding={5} margin={5} key={marca}>{marca}</SText>
                        })
                    }
                    </SView>
                    <SText padding={15} fontSize={20} color='#fff'>{Object.keys(this.state.modelos).length} modelos.</SText>
                    <SView flex row>
                    {
                        Object.keys(this.state.modelos).map((modelo)=>{
                            return <SText border={1} padding={5} margin={5} key={modelo}>{modelo}</SText>
                        })
                    }
                    </SView>
                    <SText padding={15} fontSize={20} color='#fff'>{Object.keys(this.state.colores).length} colores.</SText>
                    <SView flex row>
                    {
                        Object.keys(this.state.colores).map((color)=>{
                            return <SText border={1} padding={5} margin={5} key={color}>{color}</SText>
                        })
                    }
                    </SView>
                    <SText padding={15} fontSize={20} color='#fff'>{Object.keys(this.state.anos).length} años.</SText>
                    <SView flex row>
                    {
                        Object.keys(this.state.anos).map((ano)=>{
                            return <SText border={1} padding={5} margin={5} key={ano}>{ano}</SText>
                        })
                    }
                    </SView>
                    <SText padding={15} fontSize={20} color='#fff'>{this.state.productos.length} productos.</SText>
                </SView>
                <SView center><SButtom onPress={(pres)=>{
                    this.verificar()
                }}>Verificar</SButtom></SView>
                
                <SView flex row >
                {
                    this.state.productos.map((producto, i)=>{
                        return <Producto ref={(ref)=>{this._ref[i]=ref}} producto={producto} index={i} key={i+""}/>
                    })
                }
                </SView>

            </>   
        }
        return <SView />
    }

    verificar = async() =>{
        console.log("iniciar");

        Object.values(this._ref).map((ref)=>{
            ref.verificarOk()
        });


        
    }

    sendToServer(data) {
        SSocket.sendPromise({
            component: "caja",
            type: "sendExcel",
            data: data
        }).then(e => {
            console.log(e);
        }).catch(e => {
            console.error(e);
        })
    }

    render() {
        return (
            <SView>
                <SHr height={20}/>
                <SText center fontSize={20}>Bienvenido al migrador de cuotas Darmotos</SText>
                <SHr height={20}/>
                {this.repaint()}
            </SView>
            
        );
    }
}
