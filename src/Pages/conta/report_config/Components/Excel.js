import React from "react";
import { View, Text, ScrollView, FlatList } from "react-native";
import * as XLSX from "xlsx-color";
// import * as XLSX from "xlsx-js-style";
import Row from "./Row";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import EditBar from "./EditBar";
// import { max, min } from "three/examples/jsm/nodes/Nodes";

import ExcelFunctions from "./ExcelFunctions";

const readWorkSheet = async () => {
    // const url ="https://drive.servisofts.com/http/home/ricky/exportado (88).xlsx";
    // const url = "/test.xlsx";
    // const response = await fetch(url);
    const excel2 = await ExcelFunctions.readFromUrl("/test.xlsx")
    throw "error"
    const arrayBuffer = await ExcelFunctions.urlToArrayBuffer("/test.xlsx")

    // const zip = await JSZip.loadAsync(arrayBuffer);
    // const stylesXML = await zip.file("xl/styles.xml").async("string");
    // const parser = new DOMParser();
    // const xmlDoc = parser.parseFromString(stylesXML, "application/xml");

    // ejemplo: obtener las fuentes
    // const fonts = xmlDoc.getElementsByTagName("font");
    // for (let font of fonts) {
    //     console.log(font.outerHTML);
    // }

    const excel = XLSX.read(arrayBuffer, { type: "array", cellStyles: true });
    const firstSheetName = excel.SheetNames[0];
    const worksheet = excel.Sheets[firstSheetName];

    // console.log(firstSheetName)
    // const sheetXML = await zip.file(`xl/worksheets/sheet1.xml`).async("string")
    // const xmlShetDoc = parser.parseFromString(sheetXML, "application/xml");

    // console.log()
    return worksheet;
};

const ExcelContext = React.createContext({});

export const useExcel = () => React.useContext(ExcelContext);

const Excel = () => {
    const [worksheet, setWorksheet] = React.useState(null);
    const data = React.useRef([]);
    const editBar = React.useRef(null);
    const cells = React.useRef({});
    const scrollX = useSharedValue(0);
    const scrollY = useSharedValue(0);

    const totalWidth = useSharedValue(0);
    const totalHeight = useSharedValue(0);



    const selectStartC = useSharedValue(0);
    const selectStartR = useSharedValue(0);
    const selectEndC = useSharedValue(-1);
    const selectEndR = useSharedValue(-1);
    const selectx1 = useSharedValue(0);
    const selecty1 = useSharedValue(0);
    const selectx2 = useSharedValue(0);
    const selecty2 = useSharedValue(0);

    const colsA = useSharedValue([]);
    const rowsA = useSharedValue([]);

    const colsP = useSharedValue([]);
    const rowsP = useSharedValue([]);

    React.useEffect(() => {

        readWorkSheet().then((worksheet) => {
            const range = XLSX.utils.decode_range(worksheet["!ref"]);
            data.current = [];

            // Para celdas combinadas


            // Columnas y filas
            const cols = worksheet["!cols"] || [];
            const rows = worksheet["!rows"] || [];


            let totalH = 0;
            for (let R = range.s.r; R <= range.e.r; ++R) {
                const height = (rows[R]?.hpx || rows[R]?.height || 30);
                rowsA.value[R] = height;
                rowsP.value[R] = totalH;
                totalH += height;
            }
            totalHeight.value = totalH;

            let totalW = 0;
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const width = (cols[C]?.wpx || cols[C]?.width || 80);
                colsA.value[C] = width;
                colsP.value[C] = totalW;
                totalW += width;
            }
            totalWidth.value = totalW;

            // Celdas
            for (let R = range.s.r; R <= range.e.r; ++R) {
                const row = [];
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellAddress = { r: R, c: C };
                    const cellRef = XLSX.utils.encode_cell(cellAddress);
                    const cell = worksheet[cellRef];

                    row.push(cell ? cell.v : null); // incluir null si no hay celda
                }
                data.current.push(row);
            }
            setWorksheet(worksheet);

        });
    }, []);

    const getCellSelect = ({ x, y }) => {
        const cellSelect = {
            r: -1,
            c: -1,
        }
        let ax = 0;
        colsA.value.map((ca, i) => {
            if (x > ax && x < ax + ca) {
                cellSelect.c = i;

            }
            ax += ca;
        })
        let ay = 0;
        rowsA.value.map((ra, i) => {
            if (y > ay && y < ay + ra) {
                cellSelect.r = i;
            }
            ay += ra;
        })

        const _merges = merges.filter(
            (m) => ((m.s.c <= cellSelect.c) && (m.e.c >= cellSelect.c)) && ((m.s.r <= cellSelect.r) && (m.e.r >= cellSelect.r))
        );
        if (_merges.length > 0) {
            const minc = Math.min(..._merges.map((m) => m.s.c));
            cellSelect.c = minc;
        }
        const _merges2 = merges.filter(
            (m) => ((m.s.r <= cellSelect.r) && (m.e.r >= cellSelect.r)) && ((m.s.c <= cellSelect.c) && (m.e.c >= cellSelect.c))
        );
        if (_merges2.length > 0) {
            const minc = Math.min(..._merges2.map((m) => m.s.r));
            cellSelect.r = minc;
        }

        // console.log(_merges)
        return cellSelect;
    }

    const intersecta = (A, B) => {
        return !(A.x2 < B.x1 ||  // A está a la izquierda de B
            A.x1 > B.x2 ||  // A está a la derecha de B
            A.y2 < B.y1 ||  // A está arriba de B
            A.y1 > B.y2);   // A está abajo de B
    }
    const dentro = (A, B) => {
        return (A.x1 >= B.x1 &&
            A.y1 >= B.y1 &&
            A.x2 <= B.x2 &&
            A.y2 <= B.y2);
    }
    const DoubleTapGesture = Gesture.Tap().numberOfTaps(2).maxDelay(200).onStart(e => {
        const celSelect = getCellSelect({ x: e.x, y: e.y })
        // Object.values(cells.current).map(cell => cell.select ? cell.setEd(false) : null)
        const c = cells.current[XLSX.utils.encode_cell({ r: celSelect.r, c: celSelect.c })];
        if (c) c.setEdit(true);
    })


    const PanGesture = Gesture.Pan()
        .onBegin(e => {
            const celSelect = getCellSelect({ x: e.x, y: e.y })
            const code = XLSX.utils.encode_cell({ r: celSelect.r, c: celSelect.c });
            Object.values(cells.current).map(cell => cell.select ? cell.setSelect(false) : null)
            cells.current[code].setSelect(true);
            Object.keys(cells.current).map(cellk => {
                if (cellk == code) return;
                const cell = cells.current[cellk];
                if (cell) cell.setEdit(false)
            })

            PanGesture.context = {
                c: celSelect.c,
                r: celSelect.r
            }
            selectStartC.value = celSelect.c;
            selectStartR.value = celSelect.r;
            selectEndC.value = -1
            selectEndR.value = -1

            if (editBar.current) editBar.current.repaint()

        }).onStart(e => {
            const celSelect = getCellSelect({ x: e.x, y: e.y })


            // selectStartC.value = celSelect.c;
            // selectStartR.value = celSelect.r;
            selectEndC.value = celSelect.c;
            selectEndR.value = celSelect.r;


        })
        .onUpdate(e => {
            const celSelect = getCellSelect({ x: Math.max(e.x, 1), y: Math.max(1, e.y) })
            if (celSelect.c > -1) {
                selectEndC.value = celSelect.c;
            }
            if (celSelect.r > -1) {
                selectEndR.value = celSelect.r;
            }

            if (selectStartC.value > -1 && selectStartR.value > -1 && selectEndC.value > -1 && selectEndR.value > -1) {
                const A = {
                    x1: Math.min(selectStartC.value, selectEndC.value),
                    y1: Math.min(selectStartR.value, selectEndR.value),
                    x2: Math.max(selectStartC.value, selectEndC.value),
                    y2: Math.max(selectStartR.value, selectEndR.value),
                }

                const _merges_in_select = merges.filter(
                    (m) => {
                        const B = {
                            x1: m.s.c,
                            y1: m.s.r,
                            x2: m.e.c,
                            y2: m.e.r,
                        }
                        if (dentro(A, B)) {
                            return true;
                        } else if (intersecta(A, B)) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                );

                if (_merges_in_select.length > 0) {
                    const max_m_c = Math.max(..._merges_in_select.map((m) => m.e.c));
                    const max_m_r = Math.max(..._merges_in_select.map((m) => m.e.r));
                    const min_m_c = Math.min(..._merges_in_select.map((m) => m.s.c));
                    const min_m_r = Math.min(..._merges_in_select.map((m) => m.s.r));
                    const maxcSelect = Math.max(selectStartC.value, selectEndC.value);
                    const mincSelect = Math.min(selectStartC.value, selectEndC.value);
                    const maxrSelect = Math.max(selectStartR.value, selectEndR.value);
                    const minrSelect = Math.min(selectStartR.value, selectEndR.value);
                    if (max_m_r > maxrSelect) {
                        if (selectStartR.value > selectEndR.value) {
                            selectStartR.value = max_m_r;
                        } else {
                            selectEndR.value = max_m_r;
                        }
                    }
                    if (min_m_r < minrSelect) {
                        if (selectStartR.value > selectEndR.value) {
                            selectEndR.value = min_m_r;
                        } else {
                            selectStartR.value = min_m_r;
                        }


                    }
                    if (max_m_c > maxcSelect) {
                        if (selectStartC.value > selectEndC.value) {

                            selectStartC.value = max_m_c;
                        } else {
                            selectEndC.value = max_m_c;
                        }
                    }
                    if (min_m_c < mincSelect) {
                        if (selectStartC.value > selectEndC.value) {
                            selectEndC.value = min_m_c;
                        } else {
                            selectStartC.value = min_m_c;
                        }
                    }


                } else {
                    selectStartC.value = PanGesture.context.c;
                    selectStartR.value = PanGesture.context.r;
                    selectEndC.value = celSelect.c;
                    selectEndR.value = celSelect.r;

                }

                // const c = Math.min(selectStartC.value, selectEndC.value)
                // const ce = Math.max(selectStartC.value, selectEndC.value)
                // const _merges = merges.filter(
                //     (m) => ((m.s.c >= c) && (m.s.c <= ce)) && ((m.s.r <= celSelect.r) && (m.e.r >= celSelect.r))
                // );
                // const max_m_c = Math.max(..._merges.map((m) => m.e.c));
                // const min_m_c = Math.min(..._merges.map((m) => m.e.c));
                // if (max_m_c > ce) selectEndC.value = max_m_c;
                // if (min_m_c < c) selectEndC.value = min_m_c;

                // const r = Math.min(selectStartR.value, selectEndR.value)
                // const re = Math.max(selectStartR.value, selectEndR.value)
                // const _merges2 = merges.filter(
                //     (m) => ((m.s.r >= r) && (m.s.r <= re)) && ((m.s.c <= celSelect.c) && (m.e.c >= celSelect.c))
                // );

                // const max_m_r = Math.max(..._merges2.map((m) => m.e.r));
                // const min_m_r = Math.min(..._merges2.map((m) => m.e.r));
                // if (max_m_r > re) selectEndR.value = max_m_r;
                // if (min_m_r < r) selectEndR.value = min_m_r;

            }
            if (editBar.current) editBar.current.repaint()

        }).onFinalize(e => {


        })

    const animatedStyleVertical = useAnimatedStyle(() => {
        return {
            transform: [{
                translateY: -scrollY.value
            }]
        }
    })
    const animatedStyleHorizontal = useAnimatedStyle(() => {
        return {
            transform: [{
                translateX: -scrollX.value
            }]
        }
    })
    const animatedStyleSelect = useAnimatedStyle(() => {

        if (!(selectStartC.value > -1 && selectStartR.value > -1 && selectEndC.value > -1 && selectEndR.value > -1)) {
            return {
                width: 0,
                height: 0,
            }
        }


        const maxc = Math.max(selectStartC.value, selectEndC.value);
        const maxr = Math.max(selectStartR.value, selectEndR.value);
        const minc = Math.min(selectStartC.value, selectEndC.value);
        const mrin = Math.min(selectStartR.value, selectEndR.value);

        selectx1.value = 0;
        for (let i = 0; i < minc; i++) {
            selectx1.value += colsA.value[i];
        }
        selectx2.value = 0;
        for (let i = 0; i <= maxc; i++) {
            selectx2.value += colsA.value[i];
        }

        selecty1.value = 0;
        for (let i = 0; i < mrin; i++) {
            selecty1.value += rowsA.value[i];
        }
        selecty2.value = 0;
        for (let i = 0; i <= maxr; i++) {
            selecty2.value += rowsA.value[i];
        }



        const left = Math.min(selectx1.value, selectx2.value);
        const top = Math.min(selecty1.value, selecty2.value);
        const width = Math.abs(selectx1.value - selectx2.value);
        const height = Math.abs(selecty1.value - selecty2.value);
        return {
            zIndex: 100,
            position: 'absolute',
            left: left,
            top: top,
            width: width,
            height: height,
            backgroundColor: 'rgba(0, 100, 255, 0.2)',
            borderColor: 'rgba(0, 100, 255, 0.8)',
            borderWidth: 1,
        }
    })


    if (!worksheet) return <Text>Cargando...</Text>;

    // Datos
    // const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const merges = worksheet["!merges"] || [];
    const cols = worksheet["!cols"] || [];
    const rows = worksheet["!rows"] || [];



    return (
        <GestureHandlerRootView style={{ flex: 1 }} >
            <ExcelContext.Provider value={{
                worksheet,
                data,
                merges,
                cols,
                rows,
                cells,
                colsA,
                rowsA,
                colsP,
                rowsP,
                selectStartC,
                selectStartR,
                selectEndC,
                selectEndR,
                editBar
            }} >
                <EditBar />
                <View style={{
                    flex: 1,
                    flexDirection: "row",
                    overflow: "hidden"

                }}>
                    <Animated.View style={[
                        animatedStyleVertical,
                        { width: 30, paddingTop: 20, }
                    ]} >
                        {data.current.map((item, index) => <View style={{
                            width: 30,
                            borderTopWidth: 1,
                            borderColor: "#aaa",
                            height: rowsA.value[index],
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#666"
                        }}><Text style={{ fontSize: 10, color: "#fff" }}>{index + 1}</Text></View>)}
                    </Animated.View >
                    <View style={{
                        flex: 1,
                    }}>
                        <Animated.View style={[animatedStyleHorizontal, {
                            flexDirection: "row",

                        }]}>
                            {data.current[0].map((col, index) => <View style={{
                                height: 20,
                                borderLeftWidth: 1,
                                width: colsA.value[index],
                                justifyContent: "center",
                                alignItems: "center",
                                borderColor: "#aaa",
                                backgroundColor: "#666"
                            }}><Text style={{ fontSize: 10, color: "#fff" }}>{XLSX.utils.encode_col(index)}</Text></View>)}
                        </Animated.View>
                        <Animated.ScrollView style={{ flex: 1 }} onScroll={e => {
                            scrollY.value = e.nativeEvent.contentOffset.y
                        }}>
                            <Animated.ScrollView horizontal onScroll={e => {
                                scrollX.value = e.nativeEvent.contentOffset.x
                            }}>
                                <GestureDetector gesture={Gesture.Simultaneous(DoubleTapGesture, PanGesture)}>
                                    <Animated.View style={{
                                        width: totalWidth.value,
                                        height: totalHeight.value
                                    }}>
                                        {data.current.map((item, index) => <Row key={index} row={item} rowIndex={index} />)}
                                        <Animated.View style={animatedStyleSelect} />
                                    </Animated.View>
                                </GestureDetector>
                            </Animated.ScrollView >
                        </Animated.ScrollView>
                    </View>
                </View>
            </ExcelContext.Provider>
        </GestureHandlerRootView>
    );
};

export default Excel