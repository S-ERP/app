import React from "react";
import { View, Text, ScrollView, FlatList } from "react-native";
import * as XLSX from "xlsx";
import { useExcel } from "./Excel";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { TextInput } from "react-native-gesture-handler";

const Cell = ({ row, rowIndex, celda, colIndex }) => {
    const [state, setState] = React.useState(false);
    const [select, setSelect] = React.useState(false);
    const [edit, setEdit] = React.useState(false);
    // const layout = useSharedValue({
    //     x: 0,
    //     y: 0,
    //     width: 0,
    //     height: 0,
    // })
    const excel = useExcel();
    const { worksheet, merges, cols, rows, cells } = excel;
    // celda, colIndex
    const code = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })
    // console.log(code);
    cells.current[code] = {
        // layout
        edit,
        setEdit,
        select,
        setSelect,
        state,
        setState
    }
    // Verificar merge
    const merge = merges.find(
        (m) => m.s.r <= rowIndex && m.e.r >= rowIndex && m.s.c <= colIndex && m.e.c >= colIndex
    );

    if (merge) {
        if (merge.s.c != colIndex || merge.s.r != rowIndex) return null;

    }
    const colSpan = merge ? merge.e.c - merge.s.c + 1 : 1;
    const rowSpan = merge ? merge.e.r - merge.s.r + 1 : 1;

    let hspan = 0;
    let wspan = 0;
    for (let i = 1; i < colSpan; i++) {
        wspan += excel.colsA.value[colIndex + i];
    }
    for (let i = 1; i < rowSpan; i++) {
        hspan += excel.rowsA.value[rowIndex + i];
    }


    // Tamaño
    // const width = (cols[colIndex]?.wpx || cols[colIndex]?.width || 80) * colSpan;
    // const height = (rows[rowIndex]?.hpx || rows[rowIndex]?.height || 30) * rowSpan;


    // Estilo de la celda
    const style = worksheet[code]?.s;



    if (select) {
        console.log(style)
    }


    const x = excel.colsP.value[colIndex];
    const y = excel.rowsP.value[rowIndex];
    const width = excel.colsA.value[colIndex];
    const height = excel.rowsA.value[rowIndex]

    const textStyle = {
        width: "100%",
        height: "100%",
        fontWeight: style?.font?.bold ? "bold" : "normal",
        fontStyle: style?.font?.italic ? "italic" : "normal",
        color: style?.fgColor?.rgb
            ? `#${style.fgColor.rgb}`
            : "black",
        textAlign: style?.alignment?.horizontal || "left",
    }
    return (
        <Animated.View
            key={colIndex}
            style={[{
                zIndex: (colSpan > 1 || rowSpan > 1) ? 4 : (select ? 10 : 1),
                position: "absolute",
                width: width + wspan,
                height: height + hspan,
                top: y,
                left: x,
                borderWidth: style?.border ? 1 : 0.5,
                borderColor: "#88888844",
                backgroundColor: style?.fgColor?.rgb
                    ? `#${style.fgColor.rgb}`
                    : "white",
                // justifyContent: "center",
                // alignItems: "center",
            }
            ]}
        >


            {!edit ? <Text style={[textStyle]}
                numberOfLines={1}
            >{excel.data.current[rowIndex][colIndex]}</Text> :
                <TextInput defaultValue={excel.data.current[rowIndex][colIndex]}
                    style={[textStyle, {
                        width: "100%",
                        height: "100%",
                        padding: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                    }]}
                    multiline
                    autoFocus
                    scrollEnabled={false}
                    onChange={e => {
                        excel.data.current[rowIndex][colIndex] = e.nativeEvent.text;
                        if (excel.editBar.current) excel.editBar.current.repaint()

                    }} />
            }
            {
                select && <View style={{
                    position: "absolute",
                    top: -1,
                    left: -1,
                    pointerEvents: "none",
                    width: width + wspan + 2,
                    height: height + hspan + 2,
                    borderWidth: 2,
                    borderColor: "blue",
                }}>
                </View>
            }

        </Animated.View >
    );
};

export default Cell;