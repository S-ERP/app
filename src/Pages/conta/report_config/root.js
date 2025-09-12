import React from "react";
import { SPage } from "servisofts-component";
import ExcelFunctions from "./Components/ExcelFunctions";

export default class root extends React.Component {

  componentDidMount() {
    ExcelFunctions.readFromUrl("/test.xlsx").then(data => {
      console.log(data)
    })
  }
  render() {
    return (
      <SPage title={"Configuracion de reportes"} disableScroll>
        
      </SPage>
    );
  }
}
  