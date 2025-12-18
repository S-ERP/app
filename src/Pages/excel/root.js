import React from "react";
import { SPage, SText } from "servisofts-component";
import ExcelUploader from "./Components/ExcelUploader";
import ExcelTable from "./Components/ExcelTable";

export default class excel extends React.Component {
    render() {
        return <SPage title={"excel"} disableScroll>
            {/* <ExcelUploader

            /> */}
            <ExcelTable />
        </SPage>
    }
}