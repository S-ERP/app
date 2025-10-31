import React from "react";
import { SImage } from "servisofts-component";
// import logoB from "./assets/logoB.png";

const DomainLogo = (props: SImage["props"]) => {
  const hostname = window.location.hostname;

  let logo = require("../../../public/logo192.png");
  if (hostname.includes("servisofts.com")) logo = require("../../Assets/img/Banner_p.png");
  else if (hostname.includes("capitalcorp-holdings.com")) logo = require("../../Assets/img/EDITAR2.png")

  return <SImage {...props}  src={logo}/>
};

export default DomainLogo;
