import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { DropFileSingle, SHr, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../Config';
import * as XLSX from "xlsx";
import ImportarExcel from '../../../Components/ImportarExcel';

interface ExcelUploaderProps {


}

const ExcelUploader = (props: ExcelUploaderProps) => {
    const tableRef = React.useRef<any>();
    return (
        <View style={styles.container}>
            <SubirExcel tableRef={tableRef} />
            <SHr />
            <ExcelEsperado tableRef={tableRef} />
        </View>
    );
};

export default ExcelUploader;


const SubirExcel = (props: any) => {
    const [file, setFile] = React.useState<any>(null);
    const [data, setData] = React.useState<any>(null);
    const [headers, setHeaders] = React.useState<any>(null);
    return (
        <View style={styles.box}>

            {data &&
                <DinamicTable
                    {...Config.table.applyTheme()}
                    hiddenMenu
                    loadData={async () => {
                        return data;
                    }}
                >

                    {[
                        <DinamicTable.Col<any> key={"index__"} label={"(" + data.length + ")"}
                            wrap
                            width={30}
                            textStyle={{
                                color: STheme.color.lightGray,
                                fontSize: 10
                            }}
                            data={e => e.index + 1} />,
                        ...headers.map((header: any) => {
                            return <DinamicTable.Col<any> key={header} label={header}
                                wrap
                                data={e => e.row[header]} />
                        })]}
                </DinamicTable>
            }


            <SView style={{ position: "absolute", width: "100%", height: "100%" }} center>
                <DropFileSingle onChange={(e: any) => {
                    if (e[0]) {

                        setData(null);
                        setFile(e[0]?.file);
                        const reader = new FileReader();
                        reader.onload = (e: any) => {
                            const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
                            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
                            const keys = Object.keys(jsonData[0]);
                            setHeaders(keys);

                            setData(jsonData);
                            if (props.tableRef?.current) {
                                props.tableRef?.current.loadData(jsonData);
                            }

                        };
                        reader.readAsArrayBuffer(e[0].file);
                    }
                }} />
                {!file && <SText>{"Click o arrastra un excel para importar"}</SText>}
            </SView>

        </View>
    );
};
const ExcelEsperado = (props: any) => {
    const tableRef = React.useRef<any>();
    const [state, setState] = React.useState<any>({
        cols: [
            { key: "codigo", key_data: "codigo" },
            { key: "nombre", key_data: "nombre" },
            { key: "cantidad", key_data: "cantidad" },
        ],
        data: []
    });
    React.useEffect(() => {
        props.tableRef.current = {
            loadData: (data: any) => {
                state.data = data;
                state.cols.map((col: any, index: any) => {
                    const k = Object.keys(data[0])[index];
                    col.key_data = k;
                })
                // setState({ ...state });
                if (tableRef.current) tableRef.current.loadData()
            }
        }
    }, [])
    return (
        <View style={[styles.box, { flex: 2 }]}>
            <DinamicTable
                {...Config.table.applyTheme()}
                hiddenMenu
                ref={tableRef}
                loadData={async () => {
                    console.log("Entro al load data")
                    return state.data;
                }}>
                {[
                    <DinamicTable.Col<any> key={"index__"} label={"#"}
                        wrap
                        width={30}
                        textStyle={{
                            color: STheme.color.lightGray,
                            fontSize: 10
                        }}
                        data={e => e.index + 1} />,
                    ...state.cols.map((col: any) => {
                        return <DinamicTable.Col<any> key={col.key} label={col.key} data={e => e.row[col.key_data]} wrap
                            
                        />
                    })
                ]}

            </DinamicTable>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        width: "100%",
        flex: 1,
        padding: 4,
    },
    box: {
        width: "100%",
        flex: 1,
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: STheme.color.card,
        borderColor: STheme.color.card,
        justifyContent: "center",
        alignItems: "center",
    }
});
