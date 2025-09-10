import React from "react";
import { SPage } from "servisofts-component";
import Excel from "./Components/Excel";

export default class root extends React.Component {
  render() {
    return (
      <SPage title={"Configuracion de reportes"} disableScroll>
        <Excel/>
      </SPage>
    );
  }
}
