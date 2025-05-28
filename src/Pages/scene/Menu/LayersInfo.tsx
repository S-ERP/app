import React from "react";
import { ScrollView } from "react-native";
import { SButtom, SHr, SIcon, SInput, SNavigation, SPage, SPopup, SText, STheme, SThread, SView } from "servisofts-component";
import * as THREE from "three"
import EditObject from "./EditObject";
import { MeshItem } from "../Meshes";
import ResizableView from "../../../Components/ResizableView";
import IconType from "./IconType";

type layersProps = {
    scene: THREE.Scene,
}

let LASTBUSUQUEDA = "";
export default class LayersInfo extends React.Component<layersProps> {

    static PopupKey = "LayersInfo";
    static REF?: LayersInfo;
    static close() {
        SPopup.close(LayersInfo.PopupKey)
    }
    static open(props: layersProps) {
        SPopup.open({
            key: LayersInfo.PopupKey,
            type: "3",
            content: <LayersInfo ref={ref => LayersInfo.REF = ref || undefined} {...props} />
        })

    }
    editObject?: EditObject;
    componentDidMount(): void {
        this.props.scene.add(this.wireframeCube)
        this.select(this.props.scene)
    }
    componentWillUnmount(): void {
        this.props.scene.remove(this.wireframeCube)
        LayersInfo.REF = undefined;
    }
    state: any = {
        busqueda: LASTBUSUQUEDA,
        open: {
            [this.props.scene.id]: true
        }
    }

    groupSelect?: THREE.Object3D;
    wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    wireframeCube = new THREE.Mesh();

    openParents(obj: THREE.Object3D) {
        if (obj.parent) {
            this.state.open[obj.parent?.id] = true;
            this.openParents(obj.parent);
        }
    }
    select(obj: THREE.Object3D) {
        this.openParents(obj);
        this.setState({ select: null })
        new SThread(200, "select", true).start(() => {
            this.setState({ select: obj.id })
        })
        this.groupSelect = obj;
        this.wireframeCube.name = "SelectedGuide"
        const boundingBox = new THREE.Box3().setFromObject(obj);
        const boxSize = boundingBox.getSize(new THREE.Vector3());
        const boxCenter = boundingBox.getCenter(new THREE.Vector3());
        const geometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
        this.wireframeCube.geometry = geometry;
        this.wireframeCube.material = this.wireframeMaterial;
        this.wireframeCube.position.copy(boxCenter);
        this.wireframeCube.updateMatrix();
    }
    validateChildrens = (obj: THREE.Object3D, busqueda: string) => {
        if ((((obj?.type ?? "").toLowerCase().indexOf(busqueda.toLowerCase()) > -1) || ((obj?.name ?? "").toLowerCase().indexOf(busqueda.toLowerCase()) > -1))) {
            return true;
        }
        if (obj.children.length > 0) {
            let valid = false;
            obj.children.forEach(child => {
                if (this.validateChildrens(child, busqueda)) {
                    valid = true;
                }
            })
            return valid;
        }
        return false;
    }
    toggleNode = (name: any) => {
        this.setState((prevState: any) => ({
            open: {
                ...prevState.open,
                [name]: !prevState.open[name]
            }
        }));
    }
    renderElement(obj: THREE.Object3D) {

        // if (obj.type == "Bone") return;
        if (!this.validateChildrens(obj, this.state.busqueda)) return;
        let encontrada = false;
        let isOpen = this.state.open[obj.id] || false;
        if (this.state.busqueda) {
            if ((((obj?.type ?? "").toLowerCase().indexOf(this.state.busqueda.toLowerCase()) > -1) || ((obj?.name ?? "").toLowerCase().indexOf(this.state.busqueda.toLowerCase()) > -1))) {
                encontrada = true;
            }
            isOpen = true;
        }

        const isSelect = this.state.select == obj.id
        return <SView style={{
            paddingLeft: !obj.parent ? 0 : 12,
        }}>
            <SView row style={{
                alignItems: "center",
                padding: 4,
                borderBottomWidth: 1,
                borderColor: STheme.color.card,
                backgroundColor: isSelect ? STheme.color.card : "transparent"
            }} onPress={() => {
                if (this.editObject) this.editObject.componentWillUnmount();
                this.select(obj)
            }}>
                <SView width={20} onPress={() => {
                    this.toggleNode(obj.id)
                }}>
                    {obj.children.length <= 0 ? null :
                        <SIcon width={12} height={12} name={"Back"} fill={STheme.color.gray} style={{
                            transform: [{ rotate: !isOpen ? "180deg" : "-90deg" }]
                        }} />}
                </SView>
                <IconType type={obj.type} />
                <SView width={8} />
                <SText bold fontSize={12} color={encontrada ? STheme.color.warning : STheme.color.text}>{obj.name}</SText>
                <SView width={8} />
                <SText fontSize={10} color={encontrada ? STheme.color.warning : STheme.color.lightGray}>{obj.type}</SText>
            </SView>
            {
                isOpen && obj.children.map(child => {
                    return this.renderElement(child);
                })
            }
        </SView >
    }
    render() {
        return <ResizableView
            right={0}
            width={250}
            disableRight
            disableTop
            disableBottom
            lineColor="#00000000"
            style={{
                position: "absolute",
                backgroundColor: "#000000",
                height: "100%",
            }}>
            <ResizableView
                right={0}
                lineColor="#00000000"
                style={{
                    width: "100%",
                }}
                disableTop
                disableLeft
                disableRight
                height={300}
            >
                <SView col={"xs-12"} height={"100%"} style={{ backgroundColor: "#2D2C2D", padding: 4, borderRadius: 6, }} >
                    <SView col={"xs-12"} padding={4} row>
                        <SInput height={24} flex placeholder={"Buscar..."} defaultValue={this.state.busqueda} onChangeText={(e) => {
                            new SThread(600, "buscar", true).start(() => {
                                LASTBUSUQUEDA = e;
                                this.setState({ busqueda: e })
                            })
                        }} />

                    </SView>
                    <ScrollView horizontal style={{ flex: 1, }} contentContainerStyle={{
                        minWidth: "100%"
                    }}>
                        <ScrollView style={{ flex: 1 }}>
                            {this.renderElement(this.props.scene)}
                            <SHr h={8} />
                        </ScrollView>
                    </ScrollView>
                </SView>
            </ResizableView>
            <SView flex style={{
                backgroundColor: "#2D2C2D",
                borderRadius: 6,
            }}>
                {this.state.select && this.groupSelect ? <EditObject ref={ref => this.editObject = ref ?? undefined} obj={this.groupSelect} /> : null}
            </SView>
        </ResizableView>
    }


    update(props: { delta: number; }) {
        if (this.groupSelect) {
            const boundingBox = new THREE.Box3().setFromObject(this.groupSelect);
            const boxSize = boundingBox.getSize(new THREE.Vector3());
            const boxCenter = boundingBox.getCenter(new THREE.Vector3());
            const geometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
            this.wireframeCube.geometry = geometry;
            this.wireframeCube.position.copy(boxCenter);
        }
    }

}