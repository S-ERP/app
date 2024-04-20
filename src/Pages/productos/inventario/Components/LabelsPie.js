import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SText, STheme, SView } from 'servisofts-component';

export default class LabelsPie extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.defaultValue ?? "#E7E28D"
        };
    }

    componentDidMount() {
        this.state.data = this.props.data;
        this.state.dataF5 = this.props.dataF5;
        this.state.dataAssigned = this.props.labelsAssigned;
        // if (this.state.dataAssigned.length == 0) {
        //     this.state.data = {}
        // }
    }



    getContent() {
        let dataF5 = this.state.dataF5;
        let data = this.state.data;
        let dataAssigned = this.state.dataAssigned;

        if (Object.keys(data).length === 0) {
            // this.setState({ data: dataAssigned })
            // this.state.dataF5 = this.state.data
            // this.props.labelsAssigned({})

            console.log("hhhhh")
        }

        return Object.values(this.state.data).map((obj, index) => {
            // console.log(obj)
            return <SView row padding={5}
                onPress={() => {
                    console.log("delete", obj)

                    dataF5[obj.key] = obj
                    // console.log("index", index)
                    delete data[obj.key]
                    // console.log("f5", dataF5)
                    this.props.onChange(dataF5)
                    this.props.labelsAssigned(data)
                }}
            >
                <SView center width={18} height={18} style={{ position: "absolute", right: 0, top: -3, backgroundColor: STheme.color.danger, borderRadius: 40, zIndex: 999 }}>
                    <SIcon name='eliminar2' width={8} height={8} fill={STheme.color.white} />
                </SView>
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
