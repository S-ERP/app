import React from "react";
import { SPage, SText } from "servisofts-component";
import STable from "servisofts-table"
export default class index extends React.Component {
    render() {
        return <SPage title={"Servisofts page"} disableScroll>
            <STable
                loadData={async () => {
                    return [
                        ["1", "2", "3", "4", "5"],
                        ["1", "2", "3", "4", "5"],
                    ]
                }}
            />
        </SPage>;
    }
}