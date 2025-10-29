import React, { Component } from "react";
import { SView, SText, STheme, SHr, SPopup, SForm } from "servisofts-component";
import MDL from "../MDL";

type Props = {
  editObject?: any,
  onSuccess?: Function,
};

export default class TestPopup extends Component<Props> {

  /**
   * Abrir el popup
   */
  static open(params: { editObject?: any; onSuccess?: () => void }) {
    const key = `testPopup_`;
    SPopup.open({
      key,
      content: (
        <SView style={{ width: "100%", maxHeight: "100%", height: 800, maxWidth: 500, borderRadius: 10, borderColor: STheme.color.card, borderWidth: 1, backgroundColor: STheme.color.background, padding: 16, }} withoutFeedback >
          <TestPopup editObject={params.editObject} onSuccess={params.onSuccess} />
        </SView>
      ),
      onClose: params.onSuccess,
    });
  }

  handleSubmit = (formData) => {
    const { editObject, onSuccess } = this.props;

    if (editObject?.key) {
      // 🔧 EDITAR
      MDL.inventario.tag.editar({ ...formData, key: editObject.key })
        .then((res) => {
          console.log("✅ Editado correctamente");
          if (onSuccess) onSuccess(res);
          SPopup.close("testPopup_");
        })
        .catch((err) => {
          console.error("❌ Error al editar:", err);
          SPopup.alert("Error al editar el registro.");
        });
    } else {
      // 🆕 REGISTRAR
      MDL.inventario.tag.registrar(formData)
        .then((res) => {
          console.log("✅ Registrado correctamente");
          if (onSuccess) onSuccess(res);
          SPopup.close("testPopup_");
        })
        .catch((err) => {
          console.error("❌ Error al registrar:", err);
          SPopup.alert("Error al registrar el modelo.");
        });
    }
  };

  render() {
    const { editObject } = this.props;

    return (
      <SView col={"xs-12"} padding={12}>
        <SText fontSize={18} bold center color={STheme.color.text}>
          {editObject?.key ? "✏️ Actualizar Tag" : "🆕 Registrar Tag"}
        </SText>

        <SHr height={12} />

        <SForm
          inputs={{
            key_usuario: { type: "text", label: "Usuario", defaultValue: editObject?.key_usuario ?? "", },
            fecha_on: { type: "text", label: "Fecha", defaultValue: editObject?.fecha_on ?? "", },
            estado: { type: "text", label: "Estado", defaultValue: editObject?.estado ?? "", },
            descripcion: { type: "text", label: "Descripción", defaultValue: editObject?.descripcion ?? "", },
            key_empresa: { type: "text", label: "Empresa", defaultValue: editObject?.key_empresa ?? "", }, }}
          onSubmitName={editObject?.key ? "Actualizar" : "Registrar"}
          onSubmit={this.handleSubmit}
        />

        <SHr height={20} />
      </SView>
    );
  }
}
