import React, { Component } from "react";
import { SView, SText, STheme, SHr, SPopup, SForm } from "servisofts-component";
import MDL from "../../../MDL";
import SIconApp from "../../../Assets/SIconApp";

type Props = {
  editObject?: any;
  onSuccess?: Function;
};

export default class PopupTag extends Component<Props> {
  form: any;

  static open(params: { editObject?: any; onSuccess?: () => void }) {
    const key = `testPopup_`;
    SPopup.open({
      key,
      content: (
        <SView
          style={{
            width: "100%",
            maxHeight: "100%",
            // height: 800,
            // height: 180,
            maxWidth: 500,
            borderRadius: 10,
            borderColor: STheme.color.card,
            borderWidth: 1,
            backgroundColor: STheme.color.background,
            padding: 16,
          }}
          withoutFeedback
        >
          <PopupTag editObject={params.editObject} onSuccess={params.onSuccess} />
        </SView>
      ),
      onClose: params.onSuccess,
    });
  }

  handleSubmit = (formData) => {
    if (!formData) {
      SPopup.alert("Por favor complete los datos del formulario.");
      return;
    }

    const { editObject, onSuccess } = this.props;

    if (editObject?.key) {

      MDL.inventario.tag.editar({ ...formData, key: editObject.key })
        .then((res) => {
          if (onSuccess) onSuccess(res);
          SPopup.close("testPopup_");
        })
        .catch(() => {
          SPopup.alert("Error al editar el registro.");
        });
    } else {

      MDL.inventario.tag.registrar(formData)
        .then((res) => {
          if (onSuccess) onSuccess(res);
          SPopup.close("testPopup_");
        })
        .catch(() => {
          SPopup.alert("Error al registrar el modelo.");
        });
    }
  };

  render() {
    const { editObject, onSuccess } = this.props;

    return (
      <SView col={"xs-12"} padding={12}>
        {/* 🔹 Título */}
        <SText fontSize={18} bold center color={STheme.color.text}> {editObject?.key ? "Actualizar Tag" : "🆕 Registrar Tag"} </SText>

        <SHr height={8} />

        {/* 🔹 Formulario */}
        <SForm
          ref={(ref: any) => (this.form = ref)}
          inputs={{ descripcion: { type: "text", label: "Descripción", defaultValue: editObject?.descripcion ?? "", }, }}
          onSubmit={this.handleSubmit}
        />

        <SHr height={8} />

        {/* 🔹 Botones */}
        <SView row style={{ justifyContent: "center", alignItems: "center", }}  >
          <SView center flex style={{ height: 28, backgroundColor: STheme.color.danger, borderRadius: 4, marginHorizontal: 4, paddingHorizontal: 12, }} onPress={() => {
            SPopup.confirm({
              title: "Eliminar el tag",
              message: "¿Está seguro de eliminar el tag " + editObject.descripcion + "?",
              onPress: (res) => {
                MDL.inventario.modelo_tag.editar({ key: editObject.key_modelo_tag, estado: 0, })
                if (onSuccess) onSuccess();
                SPopup.close("testPopup_");
              }
            });

          }}>
            <SView row center >
              <SText color={STheme.color.text} fontSize={12}><SIconApp name="Delete" width={12} /> ELIMINAR</SText>
            </SView>
          </SView>
          <SView width={10} />
          <SView center flex style={{ height: 28, backgroundColor: "transparent", borderColor: STheme.color.text, borderWidth: 1, borderRadius: 4, marginHorizontal: 4, paddingHorizontal: 12, }} onPress={() => SPopup.close("testPopup_")} > <SText color={STheme.color.text} fontSize={12}>CANCELAR</SText>
          </SView>
          <SView width={10} />
          <SView center flex style={{ height: 28, backgroundColor: STheme.color.text, borderRadius: 6, marginHorizontal: 4, paddingHorizontal: 12, }} onPress={() => { if (this.form) this.form.submit(); }}>
            <SText color={STheme.color.background} fontSize={12}> {editObject?.key ? "ACTUALIZAR" : "REGISTRAR"} </SText>
          </SView>
        </SView>
        {/* <SHr height={80} /> */}

      </SView>
    );
  }
}
