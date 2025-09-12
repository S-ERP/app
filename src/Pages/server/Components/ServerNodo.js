import React from "react";
import { SDate, SHr, SPage, SText, STheme } from "servisofts-component";
import PizarraNodo from "../../../Components/Pizarra/PizarraNodo";
import { StyleSheet, View } from "react-native";
import Puerto from "../../../Components/Pizarra/Puerto";


const ServerNodo = (props: any) => {


    // lastCommit() {
    //     const OWNER = "servisofts";        // Reemplaza con el dueño del repo
    //     const REPO = this.props.servicio.nombre;          // Reemplaza con el nombre del repo
    //     const BRANCH = "main";      // Reemplaza con la rama

    //     const url = `https://api.github.com/repos/${OWNER}/${REPO}/branches/${BRANCH}`;

    //     fetch(url, {
    //         headers: {
    //             "Authorization": `token ${TOKEN}`,
    //             "Accept": "application/vnd.github+json"
    //         }
    //     })
    //         .then(response => {
    //             if (!response.ok) throw new Error(`Error ${response.status}`);
    //             return response.json();
    //         })
    //         .then(data => {
    //             console.log(data)
    //             console.log("Último commit SHA:", data.commit.sha);
    //             console.log("Fecha del último commit:", data.commit.commit.author.date);
    //             console.log("Mensaje:", data.commit.commit.message);
    //         })
    //         .catch(err => console.error("Error:", err));
    // }
    const { servicio } = props;
    const TimePased = new SDate(servicio.fecha_last);
    let extraStyle = {
        borderColor: STheme.color.card,
        opacity: 0.5
    }

    const dateLast = new SDate(servicio.fecha_last, "yyyy-MM-ddThh:mm:ss").toTimezone("America/La_Paz");
    let active = false;
    if (servicio.fecha_last) {
        extraStyle.opacity = 1;
        if (dateLast.diffTime(new SDate()) < 1000 * 60 * 60 * 24 * 30) {
            active = true;
        }
    }
    if (servicio.version != "2") {
        // extraStyle.borderColor = STheme.color.danger + "66";
        // extraStyle.borderWidth = 2;
    }

    return <View style={[style.nodo, extraStyle]}>
        <View style={[{
            flex: 1,
            width:"100%",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 4,
            backgroundColor: STheme.colorFromText(servicio.nombre) + "44"
        }]}>
            <SText clean style={style.textTitle} numberOfLines={1}>{servicio.nombre}</SText>
            <SHr h={4} />
            <SText clean style={style.textInfo}>{`${servicio.ip}`}</SText>
            <SText clean style={style.textInfo}>{`${servicio.puerto}  ${servicio.puerto_ws}  ${servicio.puerto_http}`}</SText>
            <SHr h={4} />
            <SText clean style={style.textInfo}>{`Conectado hace ${dateLast.timeSince(new SDate())}`}</SText>
            <View style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 15,
                height: 15,
                backgroundColor: active ? "green" : "red",
                borderRadius: 100,
            }}>

            </View>
            {props.children}
        </View>
    </View>
}

const style = StyleSheet.create({
    nodo: {
        width: 190,
        height: 100,
        backgroundColor: STheme.color.background,
        borderWidth: 1,
        borderColor: STheme.color.card,
        borderRadius: 4,

    },
    textTitle: {
        maxWidth: "100%",
        fontSize: 22,
        fontWeight: "bold"
    },
    textInfo: {
        maxWidth: "100%",
        fontSize: 12,
        color: STheme.color.lightGray
    }
})

export default ServerNodo;