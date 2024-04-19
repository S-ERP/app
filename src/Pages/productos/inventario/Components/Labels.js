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

    // componentDidMount() {
    //     this.state.data = this.props.data;
    // }

    Color({ color }) {
        let isselec = this.state.value == color;
        return <SView padding={3} onPress={() => {
            if (this.props.onChange) {
                this.props.onChange(color)
            }
            this.setState({ value: color })
        }}>
            <SView style={{
                width: 24,
                height: 24,
                borderRadius: 100,
                backgroundColor: color,
                borderWidth: isselec ? 2 : 1,
                borderColor: isselec ? "#000" : "#aaa"

            }}>

            </SView>
        </SView>
    }
    getContent() {
        console.log("this.state.data")
        console.log(this.state.data)
        let dataF5 = this.state.data;
        return Object.values(this.state.data).map((obj, index) => {
            // console.log(obj)
            return <SView row padding={5}
                onPress={() => {
                    console.log("delete", obj)
                    console.log("index", index)
                    delete dataF5[obj.key]
                    console.log("f5", dataF5)
                    this.props.onChange(dataF5)
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
