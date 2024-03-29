import React, { Component } from 'react';

import { SView, SText, STheme, SGradient, SIcon, SNavigation, SHr, SImage } from 'servisofts-component'
import Model from '../../../../Model';
import SSocket from 'servisofts-socket'
export default class index extends Component {

    constructor(props) {
        super(props);
    }

    getOption = (obj) => {
        return <SView col={"xs-2.4"} onPress={() => {
            if (this.props.onPress) this.props.onPress(obj)
            SNavigation.navigate(obj.href)
            console.log(this.props.url)
        }} row center height >
            <SView width={8} height />
            <SView width={24} height={24}>
                {obj.icon}
            </SView>
            <SView width={8} height />
        </SView>
    }
    getOptionCenter = (obj) => {
        return <SView col={"xs-2.4"} onPress={() => {
            SNavigation.navigate(obj.href)
        }} row center height >
            <SView width={8} height />
            <SView width={55} height={55}>
                {obj.icon}
                <SHr height={33} />
                <SText fontSize={10} center color={STheme.color.white} >{obj.label}</SText>
            </SView>
            <SView width={8} height />
        </SView>
    }
    getOptionUser = () => {
        let user = Model.usuario.Action.getUsuarioLog();
        return <SView col={"xs-2.4"} onPress={() => {
            if (user) {
                SNavigation.navigate("/perfil", { pk: user.key });
            } else {
                SNavigation.navigate("/login")
            }
            // console.log(this.props.url)
        }} row center height >
            <SView width={8} height />
            <SView width={26} height={26} style={{
                borderRadius: 100,
                borderColor: ((this.props.url == "/perfil") || (this.props.url == "/login")) ? STheme.color.secondary : STheme.color.text,
                borderWidth: 1,
                overflow: "hidden"
            }} center>
                {!user ?
                    <SIcon name={"Profile"} width={18} height={18} fill={STheme.color.primary} stroke={(this.props.url == "/login") ? STheme.color.secondary : STheme.color.text} />
                    :
                    <SImage src={Model.usuario._get_image_download_path(SSocket.api, user.key) + "?date=" + new Date().getTime()} style={{ borderWidth: 1 }} />
                }
            </SView>
            <SView width={8} height />
        </SView>
    }
    getGradient() {
        var size = 14;
        return <SView col={"xs-12"} height={size} style={{
            position: "absolute",
            top: -size,
        }}>
            <SGradient colors={[STheme.color.primary, STheme.color.primary + "00"]} />
        </SView>
    }
    render() {
        return <SView col={"xs-12"} height={55} center >
            <SGradient colors={["#155830", "#37A614" ]} />
            {/* <SGradient colors={["#37A614", "#155830" + "20"]} /> */}

            {/* {this.getGradient()} */}
            {/* <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderBottomColor: STheme.color.primary }}></SView> */}
            <SView col={"xs-11"} row flex center  >
                {/* {this.getOption({ key: "home", icon: <SIcon name={"Home"} fill={STheme.color.primary} stroke={(this.props.url == "/root") ? STheme.color.secondary : STheme.color.text} />, href: "/root" })} */}
                {/* {this.getOption({ key: "search", icon: <SIcon name={"Search2"} fill={STheme.color.primary} stroke={(this.props.url == "/sucursal") ? STheme.color.secondary : STheme.color.text} />, href: "/sucursal" })} */}
                {this.getOptionCenter({ key: "logo", icon: <SIcon name={"LogoFooter"} fill={STheme.color.white} style={{ position: "absolute", top: -24 }} />, href: "/inicio", label:"Ingresar" })}

                {/* {this.getOption({ key: "bag", icon: <SIcon name={"Bag"} fill={STheme.color.primary} stroke={(this.props.url == "/servicio") ? STheme.color.secondary : STheme.color.text} />, href: "/servicio" })} */}
                {/* {this.getOptionUser()} */}
            </SView>
        </SView>
    }
}
