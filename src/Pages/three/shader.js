import React from "react";
import { SPage, SText } from "servisofts-component";
import ShaderEditor from "../../Components/SThree/ShaderEditor";
import * as THREE from 'three';

export default class index extends React.Component {
    render() {
        return <SPage title={"Shader Editor"} disableScroll>
            <ShaderEditor />
        </SPage>
    }
}