import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SImage, SPage, SText, STheme, SView, SNavigation, SPopup } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../../Model';
import SharedFunctions from './SharedFunctions';
export type BoxMenuLatOtrosPropsType = {
    datas: any,
    onPress?: (obj) => {},
}
class index extends Component<BoxMenuLatOtrosPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handlePress() {
        if (!this.props.onPress) return null;

        this.props.onPress(this.props.datas)
    }

    renderBox() {
        var INSTACE = this;
        return <SView col={"xs-11 sm-9 md-7 xl-5 xxl-4"} center row withoutFeedback backgroundColor={STheme.color.background}
            style={{
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 1,
                borderBottomWidth: 2,
                borderColor: "#66666622",
                marginBottom: 50,

            }}
        >
            <SHr height={15} />

            <SView col={"xs-12  "} center row >
                <SView col={"xs-11"} row center>
                    <SView col={"xs-12"} height={48} center
                        style={{
                            borderBottomColor: STheme.color.gray,
                            borderBottomWidth: 1
                        }}
                        onPress={() => { }}
                    >
                        <SText fontSize={14} >Copiar enlace</SText>
                    </SView>
                    <SView col={"xs-12"} height={48} center
                        onPress={() => {
                            SharedFunctions.compartir({
                                text: `${this.props.datas?.descripcion}`,
                                url: `${"https://TlleBo.servisofts.com/app/publicacion/post?pk=" + this.props.datas?.key}`,
                            });
                        }}
                    >
                        <SText fontSize={14} >Compartir</SText>
                    </SView>
                    {/* <SView col={"xs-12"} height={48} center
                        
                        onPress={() => { }}
                    >
                        <SText fontSize={14} >Dejar de seguir</SText>
                    </SView> */}
                    <SHr height={15} />
                    {/* <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray }}></SView> */}
                    {/* <SHr height={18} /> */}
                </SView>
            </SView>
            <SView flex />
        </SView>
    }

    render() {
        return (<SView col={"xs-12"} center>
            {/* <SText>{JSON.stringify(this.props.data)}</SText> */}
            {this.renderBox()}
            <SHr h={8} />
        </SView >
        );
    }
}
export default (index);