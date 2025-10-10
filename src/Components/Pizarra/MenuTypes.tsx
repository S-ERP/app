import React, { useEffect } from "react";
import { SGradient, SText, STheme, SThread, SView } from "servisofts-component";
import { usePizarra } from "./Pizarra";

const MenuType = ({ onChange, type }: { type: string, onChange: (type: "select" | "move") => void }) => {
    const [selected, setSelected] = React.useState<"select" | "move">(type as any);
    const pizarra = usePizarra();




    return <SView style={{
        // width: 120,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        position: "absolute",
        bottom: 0,

        backgroundColor: STheme.color.background,
    }}>
        <SText card padding={8} style={{
            fontWeight: selected === "select" ? "bold" : "normal",
            opacity: selected === "select" ? 1 : 0.5,
        }} onPress={() => {
            setSelected("select");
            onChange("select");
        }}>{"select"}</SText>
        <SText card padding={8} style={{
            fontWeight: selected === "move" ? "bold" : "normal",
            opacity: selected === "move" ? 1 : 0.5,
        }} onPress={() => {
            setSelected("move");
            onChange("move");
        }}>{"move"}</SText>
        <SView width={16} />
        <SText card padding={8} style={{
            fontWeight: "normal",
            opacity: 1,
        }} onPress={() => {
            // pizarra.toJSon();
            console.log(pizarra.toJSon());
            // console.log(JSON.stringify({nodos: Object.keys(usePizarra().nodos.current), puertos: Object.keys(usePizarra().puertos.current), lineas: Object.keys(usePizarra().lineas.current)}));
        }}>{"toJSon"}</SText>
        <SView width={16} />
        <SText card padding={8} style={{
            fontWeight: "normal",
            opacity: 1,
        }} onPress={() => {
            // pizarra.toJSon();
            // pizarra.saveChanges();
            // console.log(JSON.stringify({nodos: Object.keys(usePizarra().nodos.current), puertos: Object.keys(usePizarra().puertos.current), lineas: Object.keys(usePizarra().lineas.current)}));
        }}>{"Save"}</SText>
    </SView>;
}

export default MenuType;