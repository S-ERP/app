import React, { Component } from 'react';
import { SPopup, SText, STheme, SView, SButtom, SInput, SHr } from 'servisofts-component';
import MDL from '../../../MDL';

type Props = {
    editObject?: any; // Objeto a editar (si existe es edición, si no es creación)
    onSuccess?: () => void;
    onCancel?: () => void;
};

export default class PopupRegistrarHabilidad extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupRegistrarHabilidad",
            content: (
                <SView style={{
                    maxHeight: "100%",
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 8,
                    borderColor: STheme.color.card,
                    borderWidth: 1,
                    backgroundColor: STheme.color.background
                }} withoutFeedback>
                    <PopupRegistrarHabilidad 
                        {...props} 
                        onCancel={() => {
                            SPopup.close("PopupRegistrarHabilidad");
                            if (props.onCancel) props.onCancel();
                        }}
                        onSuccess={() => {
                            SPopup.close("PopupRegistrarHabilidad");
                            if (props.onSuccess) props.onSuccess();
                        }}
                    />
                </SView>
            )
        });
    }

    state = {
        descripcion: this.props.editObject?.descripcion || "",
        isSaving: false,
        isEditing: !!this.props.editObject // Si hay editObject, estamos editando
    };

    inputRef: any;

    componentDidMount() {
        // Si estamos editando, enfocar el input
        if (this.inputRef && this.props.editObject) {
            setTimeout(() => {
                if (this.inputRef && this.inputRef.focus) {
                    this.inputRef.focus();
                }
            }, 100);
        }
    }

    handleGuardar = async () => {
        const { descripcion, isSaving, isEditing } = this.state;
        const { editObject } = this.props;
        
        if (isSaving) return;
        
        if (!descripcion || descripcion.trim() === '') {
            return;
        }
        
        this.setState({ isSaving: true });
        
        try {
            const habilidadNombre = descripcion.trim();
            
            if (isEditing && editObject) {
                // MODE: EDITAR - Actualizar registro existente
                const dataToSend = {
                    key: editObject.key,
                    descripcion: habilidadNombre,
                    estado: editObject.estado || 1,
                };
                
                // IMPORTANTE: Necesitas tener un método 'editar' en MDL.habilidad
                // Si no existe, necesitas crearlo similar a 'registro'
                await MDL.habilidad.editar(dataToSend);
                
            } else {
                // MODE: CREAR - Nuevo registro
                const dataToSend = {
                    descripcion: habilidadNombre,
                    estado: 1,
                };
                
                await MDL.habilidad.registro(dataToSend);
            }
            
            // Limpiar el input
            this.setState({ descripcion: "" });
            
            // Notificar éxito
            if (this.props.onSuccess) {
                this.props.onSuccess();
            }
            
        } catch (error) {
            console.error("Error al guardar habilidad:", error);
        } finally {
            this.setState({ isSaving: false });
        }
    };

    render() {
        const { descripcion, isSaving, isEditing } = this.state;
        const { editObject } = this.props;

        return (
            <SView col={"xs-12"} center padding={16}>
                <SText fontSize={16} bold>
                    {isEditing ? "Editar Habilidad" : "Registrar Nueva Habilidad"}
                </SText>
                <SHr />
                
                <SInput
                    ref={(ref: any) => this.inputRef = ref}
                    placeholder="Nombre de la habilidad"
                    value={descripcion}
                    onChangeText={(text: string) => {
                        this.setState({ descripcion: text });
                    }}
                    onSubmitEditing={this.handleGuardar}
                    style={{
                        width: "100%",
                        marginBottom: 16,
                        color: STheme.color.danger,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        borderRadius: 4,
                        paddingHorizontal: 8,
                        backgroundColor: STheme.color.white
                    }}
                    autoFocus={true}
                />
                
                {isEditing && editObject && (
                    <SView style={{ marginBottom: 16 }}>
                        <SText fontSize={10} color={STheme.color.lightGray}>
                          
                        </SText>
                    </SView>
                )}
                
                <SHr h={16} />
                
                <SView row col={"xs-12"}>
                    {this.props.onCancel && (
                        <>
                            <SButtom 
                                type='danger' 
                                onPress={() => {
                                    if (this.props.onCancel) this.props.onCancel();
                                }}
                                style={{ flex: 1, marginRight: 8 }}
                                disabled={isSaving}
                            >
                                <SText color={STheme.color.white}>Cancelar</SText>
                            </SButtom>
                        </>
                    )}
                    
                    <SButtom 
                        type='primary' 
                        onPress={this.handleGuardar}
                        style={{ flex: 1 }}
                        disabled={isSaving || !descripcion.trim()}
                    >
                        <SText color={STheme.color.white}>
                            {isSaving ? "Guardando..." : (isEditing ? "Actualizar" : "Guardar")}
                        </SText>
                    </SButtom>
                </SView>
            </SView>
        );
    }
}