
import React, { Component } from 'react';
import MDL from '../../../MDL';
import { SForm, SHr, SIcon, SInput, SNotification, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';


type PopupRazonType = {
    onRegister: (e: any) => void,
    onActualizar: (e: any) => void,
    onCancel?: () => void,
    tipo?: string // tipo por defecto: "spam", "fuera_perfil", etc.
};

export default class PopupDispositivo extends Component<PopupRazonType & { defaultData?: any }> {
    static open(props: PopupRazonType) {
        SPopup.open({
            key: "ppuprellamada",
            content: (
                <SView
                    backgroundColor={STheme.color.background}
                    style={{ borderRadius: 8, maxWidth: 320 }}
                    padding={16}
                    withoutFeedback
                    col={"xs-11"}
                >
                    <PopupDispositivo
                        {...props}
                        onRegister={(e) => {
                            SPopup.close("ppuprellamada");
                            props.onRegister?.(e);
                        }}
                        onCancel={() => {
                            SPopup.close("ppuprellamada");
                            props.onCancel?.();
                        }}
                    />
                </SView>
            )
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            descripcionDispositivos: [],
        };
    }

    form: SForm | null = null;

    async componentDidMount() {
        await this.loadMotivosLead();
    }

    loadMotivosLead = async () => {
        this.setState({ loading: true, error: null, descripcionDispositivos: [] });
        try {
            const allDevices = await MDL.whatsapp.device.getAll();
            if (!allDevices || Object.keys(allDevices).length === 0) {
                throw new Error("No se encontraron dispositivos");
            }

            const miempresa = MDL.empresa.select?.key;
            if (!miempresa) {
                throw new Error("No se encontró la key de la empresa");
            }

            const dispositivosFiltrados = Object.values(allDevices)
                .filter(item => item.key_empresa === miempresa)
                .map(item => ({
                    key: item.key,
                    content: item.descripcion
                }));

            const motivosConDefault = [
                { key: "", content: "--" },
                ...dispositivosFiltrados
            ];

            this.setState({ descripcionDispositivos: motivosConDefault, loading: false });
        } catch (e) {
            console.error("Error al cargar motivos:", e);
            this.setState({
                error: "No se pudieron cargar los dispositivos",
                loading: false
            });
            SNotification.send({
                title: "Error",
                body: "No se pudieron cargar los dispositivos",
                type: "error"
            });
        }
    };

    render() {
        const { defaultData } = this.props;
        const { descripcionDispositivos } = this.state;

        return (
            <SView center>
                <SText bold>Indique el disposi de {this.props.key_whatsapp_device}</SText>
                <SHr height={20} />

                <SForm
                    row
                    ref={(ref: any) => (this.form = ref)}
                    style={{ justifyContent: "space-between" }}
                    inputs={{
                        "key_tipoMovimientoLead": {
                            col: "xs-12",
                            label: "Seleccione una razón *",
                            type: "select",
                            autoFocus: true,
                            required: true,
                            defaultValue: this.props?.key_whatsapp_device ?? "",
                            options: descripcionDispositivos,
                            height: 50,
                            onChange: (value) => {
                                console.log("Seleccionado", value);
                            }
                        },
                    }}
                    onSubmit={(formData: any) => {
                        const selectedOption = descripcionDispositivos.find(
                            option => option.key === formData.key_tipoMovimientoLead
                        );
                        const data = { selectedOption };
                        this.props.onRegister?.(data);
                    }}
                />

                <SHr height={20} />

                <SView row col={"xs-12"}>
                    {this.props.onCancel && (
                        <>
                            <PButtom flex type="danger" onPress={this.props.onCancel}>
                                CANCELAR
                            </PButtom>
                            <SView width={8} />
                        </>
                    )}

                    <PButtom flex type="secondary" onPress={() => this.form?.submit()}>
                        {defaultData ? "ACTUALIZAR" : "ACEPTAR"}
                    </PButtom>
                </SView>
            </SView>
        );
    }
}
