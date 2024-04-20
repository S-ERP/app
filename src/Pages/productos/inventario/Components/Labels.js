import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SText, STheme, SView } from 'servisofts-component';

export default class Labels extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.defaultValue ?? "#E7E28D"
        };
    }

    componentDidMount() {
        this.state.data = this.props.data;
        this.state.dataAssigned = this.props.labelsAssigned;
       
    }

   
    getContent() {
      
        let dataF5 = this.state.data;
        let dataAssigned = this.state.dataAssigned;
        if(Object.keys(this.props.dataF5).length === 0 ){
            //  dataAssigned = this.props.dataF5;
           
            // console.log("ENTROOOO")
            // dataAssigned={}
        }
       

        console.log("dataf555", dataAssigned)
    
        return Object.values(this.state.data).map((obj, index) => {
            // console.log(obj)
            return <SView row padding={5}
                onPress={() => {
                    console.log("delete", obj)
                    // Object.assign(dataAssigned, { [obj.key]: obj })
                    dataAssigned[obj.key] = obj
                    console.log("index", index)
                    delete dataF5[obj.key]
                    console.log("f5", dataF5)
                    this.props.onChange(dataF5)
                    console.log("dataAssigned", dataAssigned)
                    this.props.labelsAssigned(dataAssigned)
                }}
            >
                <SView row padding={2}
                    style={{
                        borderWidth: 1,
                        borderColor: obj.color,
                        backgroundColor: obj.color + "50",
                        borderRadius: 16
                    }} >
                    <SView width={22} height={22} center backgroundColor={STheme.color.primary} borderRadius={45}>
                        {/* <SImage source={require("")} width={30} height={30} /> */}
                    </SView>
                    <SView width={5} />
                    <SView center>
                        <SText fontSize={12}>{obj.descripcion}</SText>
                    </SView>
                    <SView width={5} />
                </SView>
            </SView>
        })
    }

    render() {
        if (this.props.data) {
            this.state.data = this.props.data;
        }
        return <SView row col={"xs-12"} >
            {this.getContent()}
        </SView>
    }
}
