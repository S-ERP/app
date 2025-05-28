import React from "react";
import { ScrollView } from "react-native";
import { SButtom, SHr, SIcon, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import * as THREE from "three"
import IconType from "./IconType";
import EditObjectTransform from "./EditObjectTransform";
import { Switch } from "react-native-gesture-handler";
import EditObjectLight from "./EditObjectLight";
import Input from "./Input";
import EditObjectMesh from "./EditObjectMesh";
import EditObjectMaterial from "./EditObjectMaterial";

type layersProps = {
    obj: THREE.Object3D,
}

const Propiedades = {
    "visible": "boolean",
    "receiveShadow": "boolean",
    "castShadow": "boolean",
    "intensity": "number",

}
let autoSave = true;
export default class EditObject extends React.Component<layersProps> {
    state = {
        autoSave: autoSave,
        save: false,
    }

    db_object: THREE.Object3D;
    changes: any = {}
    original: any = {};
    constructor(props: layersProps) {
        super(props);
        this.db_object = this.buscarMeshPadre(this.props.obj)
    }

    componentWillUnmount(): void {
        if (!this.state.save) {
            Object.keys(this.original).forEach(e => {
                // @ts-ignore
                if (typeof this.original[e] != "object") {
                    // @ts-ignore
                    this.props.obj[e] = this.original[e];
                } else {
                    if (e == "material") {
                        // @ts-ignore
                        console.log("Falta volver el estado de los materiales cuando no guardo")
                    } else {
                        // @ts-ignore
                        Object.keys(this.original[e]).forEach(key2 => {

                            // @ts-ignore
                            this.props.obj[e][key2] = this.original[e][key2];
                        })
                    }

                }
            })
        }
    }


    buscarMeshPadre(object: THREE.Object3D): any {
        if (object.userData?.key) return object;
        if (object.parent) return this.buscarMeshPadre(object.parent);
        return null;
    }


    handleGuardar = () => {
        // console.log("Objeto de la base", this.db_object)
        // console.log("Objeto THREE Seleccionado", this.props.obj)
        // console.log("Objeto changes", this.changes)
        // console.log("Objeto original", this.original)
        if (!this.db_object) {
            SNotification.send({
                title: "Error",
                body: "No puedes modificar un objeto que no se encuentra en la DB",
                color: STheme.color.danger,
                time: 5000,
            })
            return;
        }
        const name = this.props.obj.name;
        this.state.save = true;
        if (this.db_object) {
            console.log("Intentado modificar", this.db_object)
            if (this.db_object.id == this.props.obj.id) {
                Object.keys(this.changes).forEach(e => {
                    if (typeof this.changes[e] == "object") {
                        this.db_object.userData[e] = {
                            ...(this.db_object.userData[e] ?? {}),
                            ...(this.changes[e] ?? {}),
                        }
                    } else {
                        this.db_object.userData[e] = this.changes[e];
                    }
                })
                this.db_object.userData.sendServer = true;
            } else {
                if (!this.db_object.userData.child_modify) {
                    this.db_object.userData.child_modify = {}
                }
                if (!this.db_object.userData.child_modify[name]) {
                    this.db_object.userData.child_modify[name] = {};
                }
                Object.keys(this.changes).forEach(e => {

                    if (typeof this.changes[e] == "object") {
                        this.db_object.userData.child_modify[name][e] = {
                            ...(this.db_object.userData.child_modify[name][e] ?? {}),
                            ...(this.changes[e] ?? {}),


                        }
                    } else {
                        this.db_object.userData.child_modify[name][e] = this.changes[e];
                    }
                })
                this.db_object.userData.sendServer = true;
            }
            console.log(" modificado", this.db_object)

        }


        // this.
        // const childrenModifications = {}

    }

    changeValue(dta: { key: string, value: any }) {
        this.state.save = false;
        // @ts-ignore
        const objElm: any = this?.props?.obj[dta.key]
        if (!this.original[dta.key]) {
            this.original[dta.key] = objElm;
        }
        // @ts-ignore
        this.props.obj[dta.key] = dta.value;
        // @ts-ignore
        this.changes[dta.key] = this.props.obj[dta.key];
        if (this.state.autoSave) {
            this.handleGuardar();
        }
    }
    handleEditObjectRecursive(newChanges: any, key: any, obj: any, original: any, changes: any, isMaterial?: boolean) {
        console.log("obj", key, newChanges, this.changes, obj, "isMaterial :" + isMaterial);
        this.state.save = false;
        if (typeof newChanges == "object") {
            // console.log("Es objeto")
            if (!original[key]) original[key] = {}
            if (!changes[key]) changes[key] = {}
            Object.keys(newChanges).forEach(key2 => {
                if (isMaterial) {
                    let materials = Array.isArray(obj) ? obj : [obj];
                    let materialFinal = materials.find(mat => mat.name == key)
                    this.handleEditObjectRecursive(newChanges[key2], key2, materialFinal, original[key], changes[key], false)
                } else {
                    this.handleEditObjectRecursive(newChanges[key2], key2, obj[key], original[key], changes[key], key == "material")
                }

            })
            return;
        }
        original[key] = obj[key];

        if (key == "color") {
            console.log(obj[key]);
            const hexPattern = /^#?([0-9A-F]{6})$/i;
            // Verifica si el valor en obj[k] es un string y coincide con el patrón hexadecimal
            if (typeof newChanges === 'string' && hexPattern.test(newChanges)) {
                const hexValue = newChanges.replace('#', ''); // Remover el '#' si está presente
                obj[key].setHex(parseInt(hexValue, 16)); // Convertir a número hexadecimal y establecer el color
            } else if (typeof newChanges === 'number') {
                obj[key].setHex(newChanges);
            } else {
                console.error("El valor no es un hexadecimal válido");
            }
        } else {
            obj[key] = newChanges;
        }
        changes[key] = newChanges;
        if (this.state.autoSave) {
            this.handleGuardar();
        }

    }

    handleEditObjectTransform(newChanges: any) {
        this.state.save = false;
        Object.keys(newChanges).map((key: string) => {
            if (!this.original[key]) {
                // @ts-ignore
                // console.log(this.props.obj[key])
                // @ts-ignore
                this.original[key] = { x: this.props.obj[key].x, y: this.props.obj[key].y, z: this.props.obj[key].z };
            }
            // @ts-ignore
            if (this.props.obj[key]) {
                // @ts-ignore
                this.props.obj[key].x = newChanges[key].x;
                // @ts-ignore
                this.props.obj[key].y = newChanges[key].y;
                // @ts-ignore
                this.props.obj[key].z = newChanges[key].z;

            }
            // @ts-ignore
            this.changes[key] = this.props.obj[key];
            if (this.state.autoSave) {
                this.handleGuardar();
            }
        })
    }
    id = 0;
    render() {

        const obj = this.props.obj;

        return <SView col={"xs-12"} height={"100%"} style={{ backgroundColor: "#00000044", padding: 4 }} center>
            <SView col={"xs-12"} row center>
                <SView flex row style={{
                    alignItems: "flex-end",
                    padding: 4,
                }}>
                    <IconType type={obj.type} />
                    <SView width={4} />
                    <SText bold fontSize={14} color={STheme.color.text}>{obj.name}</SText>
                    <SView width={4} />
                    <SText color={STheme.color.lightGray} fontSize={12}>{obj.type}</SText>
                    <SView width={4} />
                    <SText color={STheme.color.lightGray} fontSize={10}>{this?.db_object?.userData?.dbtype}</SText>
                    {/* <SText color={STheme.color.lightGray} fontSize={10}>{this?.db_object?.userData?.key}</SText> */}
                </SView>
            </SView>
            <SHr h={4} />

            <ScrollView style={{ flex: 1, width: "100%" }} >
                <Input label="Visible" type="boolean" defaultValue={this.props.obj.visible} onChange={e => {
                    this.handleEditObjectRecursive(e, "visible", this.props.obj, this.original, this.changes)
                }} />
                <SHr h={4} />
                <SView style={{
                    backgroundColor: "#313031",
                    padding: 4,
                    borderRadius: 4,
                }}>
                    <SText fontSize={12}>Save options</SText>
                    <SHr />
                    <Input label="Real Time" type="boolean" defaultValue={this.state.autoSave} onChange={(e) => {
                        autoSave = e;
                        this.setState({ autoSave: e })
                    }} />
                    {/* <SView row style={{
                        paddingLeft: 12,
                        alignItems: "center"
                    }}>
                        <SText fontSize={12} width={60} style={{
                            textAlign: "right"
                        }}>{"Real Time"}</SText>
                        <SView width={8} />
                        <Switch value={this.state.autoSave} onValueChange={e => {
                            autoSave = e;
                            this.setState({ autoSave: e })
                        }} />
                    </SView> */}
                    <SHr />
                    {this.state.autoSave ? null :
                        <SView col={"xs-12"} center>
                            <SButtom style={{ height: 25 }} type="outline" onPress={this.handleGuardar.bind(this)}>GUARDAR</SButtom>
                        </SView>
                    }
                </SView>
                <SHr h={4} />

                <EditObjectTransform obj={this.props.obj} onChange={(newChanges) => {
                    this.handleEditObjectTransform(newChanges)

                }} />
                {!["PointLight", "AmbientLight", "PuntualLight", "SpotLight"].includes(this.props.obj.type) ? null :
                    <>
                        <SHr h={4} />
                        <EditObjectLight obj={this.props.obj as THREE.Light} onChange={(newChanges) => {
                            Object.keys(newChanges).map(key => {
                                this.handleEditObjectRecursive(newChanges[key], key, this.props.obj, this.original, this.changes)
                            })

                        }} />
                    </>
                }
                {
                    //@ts-ignore
                    !this.props.obj.isMesh ? null :
                        <>
                            <SHr h={4} />
                            <EditObjectMesh obj={this.props.obj as THREE.Mesh} onChange={(newChanges) => {
                                Object.keys(newChanges).map(key => {
                                    this.handleEditObjectRecursive(newChanges[key], key, this.props.obj, this.original, this.changes)
                                })

                            }} />
                            <SHr h={4} />
                            <EditObjectMaterial obj={this.props.obj as THREE.Mesh} onChange={(newChanges) => {
                                // Object.keys(newChanges).map(key => {
                                // console.log(key, newChanges[key])
                                // Object.keys(newChanges).map(key => {
                                //     this.handleEditObjectRecursive(newChanges[key], key, this.props.obj, this.original, this.changes)
                                // })
                                console.log("new Changes", newChanges)
                                this.handleEditObjectRecursive(newChanges["material"], "material", this.props.obj, this.original, this.changes)
                                // })

                            }} />
                        </>
                }
                {
                    //@ts-ignore
                    !this.props.obj.userData ? null :
                        <>
                            <SHr h={50} />
                            <SText fontSize={10}>{"User data: \n" + JSON.stringify(this.props.obj.userData, null, "\t")}</SText>
                        </>
                }

                {/* {Object.keys(this.props.obj).filter(a => Object.keys(Propiedades).includes(a)).map((k: any) => this.renderInput(k))} */}
                <SHr />

            </ScrollView>
            {/* <SInput height={400} type="textArea" defaultValue={JSON.stringify(this.props.obj)} /> */}
        </SView>
    }
}