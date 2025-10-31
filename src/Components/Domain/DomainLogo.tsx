import React from "react";
import { SImage, SText } from "servisofts-component";
// import logoB from "./assets/logoB.png";

const DomainLogo = (props: SImage["props"]) => {
  const hostname = window.location.hostname;

  let logo = "/__servisofts/logo512.png"
  if (hostname.includes("capitalcorp-holdings.com")) logo = "/capitalcorp/logo512.png"
  if (hostname.includes("servisofts.com")) logo = "/__servisofts/logo512.png"

  // return <SText>{hostname}</SText>
  return <SImage {...props} src={logo} />
};

export default DomainLogo;
