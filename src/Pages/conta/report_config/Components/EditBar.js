import React from "react";
import { View, Text, ScrollView, FlatList, TextInput } from "react-native";
import { useExcel } from "./Excel";
import { SText } from "servisofts-component";
import * as XLSX from "xlsx-color";

const EditBar = ({ row, rowIndex, celda, colIndex }) => {
    const [state, setState] = React.useState({});
    const excel = useExcel();

    excel.editBar.current = {
        repaint: () => {
            setState({ ...state })
        }
    }
    const code = XLSX.utils.encode_cell({ r: excel.selectStartR.value, c: excel.selectStartC.value })
    let code2 = "";
    if (excel.selectEndR.value > -1 && excel.selectEndC.value > -1) {
        code2 = XLSX.utils.encode_cell({ r: excel.selectEndR.value, c: excel.selectEndC.value })
    }
    return <View style={{
        width: "100%",
        height: 25,
        backgroundColor: "#666",
        flexDirection: "row",
        padding: 3,
        paddingHorizontal: 4,
    }}>
        <View style={{ width: 50, borderWidth: 1, }}>
            <SText>{`${code}${code2 ? ":" + code2 : ""}`}</SText>
        </View>
        <View style={{ width: 8 }} />
        <View style={{ flex: 1, borderWidth: 1, }}>
            <TextInput
                style={{
                    color: "#fff"
                }}
                value={excel.data.current[excel.selectStartR.value][excel.selectStartC.value]}
                onChangeText={(text) => {
                    excel.data.current[excel.selectStartR.value][excel.selectStartC.value] = text;
                    if (excel.cells.current[code]) {
                        excel.cells.current[code].setState({ ...excel.cells.current[code].state })
                    }
                    setState({ ...state })
                }}
            />
        </View>
    </View >
};

export default EditBar;