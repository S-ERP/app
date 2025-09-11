import React from "react";
import { View, Text, ScrollView, FlatList } from "react-native";
import * as XLSX from "xlsx";
import { useExcel } from "./Excel";
import Cell from "./Cell";

const Row = ({ row, rowIndex }) => {
    // const excel = useExcel();


    return row.map((celda, colIndex) => {
        return <Cell celda={celda} colIndex={colIndex} row={row} rowIndex={rowIndex} />
    })
    // return <View key={rowIndex} style={{ flexDirection: "row" }}>
    //     {row.map((celda, colIndex) => {
    //         return <Cell celda={celda} colIndex={colIndex} row={row}  rowIndex={rowIndex} />
    //     })}
    // </View>


};

export default Row;