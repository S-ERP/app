import { SPage } from "servisofts-component";
import root from "./root";
import cubo from "./cubo"
import mesh from "./mesh";
import fp from "./fp";
import world from "./world"
// import human from "./human"
// import AmmoExample from "./AmmoExample";
import PrimeraPersona from "./primeraPersona"
// import Ammo2 from "./Ammo2";
import preview from "./preview";
import city from "./city"
import shader from "./shader"

export default SPage.combinePages("three", {
    "": root,
    world,
    city,
    cubo,
    mesh,
    fp,
    // human,
    // AmmoExample,
    PrimeraPersona,
    // Ammo2,
    preview,
    shader
})
