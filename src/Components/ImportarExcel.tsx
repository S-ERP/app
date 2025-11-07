import React from "react";
import { SInput, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import FileChooser from "./SUpload/FileChooser";
import * as XLSX from "xlsx";
import { DinamicTable } from "servisofts-table";
import Config from "../Config";
type ColProps = {
    key: string,
    col?: string,
    width?: number,
}
type ImportarExcelProps = {
    cols: ColProps[],
    onSave?: (data: any[]) => void
}
export default class ImportarExcel extends React.Component<ImportarExcelProps & { data: any }> {
    static open(props: ImportarExcelProps) {
        FileChooser({ accept: ".xlsx, .xls" }).then((files: any) => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
                SPopup.open({
                    key: "importar-excel",
                    content: <SView style={{
                        width: "100%",
                        maxWidth: 500,
                        backgroundColor: STheme.color.background,
                        borderRadius: 8,
                        overflow: "hidden",
                        padding: 4,
                        maxHeight: "100%",
                    }} height={500} withoutFeedback>
                        <ImportarExcel {...props} data={jsonData} />
                    </SView>
                })
                console.log(jsonData)
            };
            reader.readAsArrayBuffer(files[0]);

        })

    }

    selectFile() {



    }
    table: DinamicTable<any> | null = null;
    render() {
        const colsElements = this.props.cols.map(c => <DinamicTable.Col
            key={c.key}
            label={c.key}
            data={a => a.row[c.col]}
            width={c.width ?? 120}

        >
            <SView padding={1} col={"xs-12"}>
                <SInput customStyle={"default"} style={{
                    height: 24,
                    padding: 0,
                    fontSize: 12
                }}
                    defaultValue={c.col ?? ""}
                    type="select2"
                    options={Object.keys(this.props.data[0])}
                    placeholder={"Selecciona una columna"}
                    onChangeText={e => {
                        c.col = e;
                        this.table?.loadData();
                    }}
                />
            </SView>
        </DinamicTable.Col>)
        return <SView col={"xs-12"} flex >
            <SView col={"xs-12"} flex>
                <DinamicTable
                    {...Config.table.applyTheme()}
                    ref={ref => this.table = ref}
                    loadData={async () => {
                        return this.props.data;
                    }}
                    cellStyle={{
                        minHeight: 20,
                    }}
                >
                    {colsElements}
                </DinamicTable>
            </SView>
            <SView col={"xs-12"} padding={4} center row>
                <SView flex />
                <SText card padding={8}>{"CANCELAR"}</SText>
                <SView flex />
                <SText card padding={8} onPress={() => {
                    const data = this.props.data;
                    const dataMapped = data.map((row: any) => {
                        const newRow: any = {};
                        this.props.cols.forEach(c => {
                            newRow[c.key] = row[c.col];
                        });
                        return newRow;
                    });
                    if (this.props.onSave) {
                        this.props.onSave(dataMapped);
                    }
                    SPopup.close("importar-excel");
                    console.log("data to import", dataMapped);
                }}>{"GUARDAR"}</SText>
                <SView flex />
            </SView>

        </SView>
    }
}