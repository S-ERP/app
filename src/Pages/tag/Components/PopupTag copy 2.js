import React, { Component } from "react";
import { SView, SText, STheme, SHr, SPopup, SForm, SInput } from "servisofts-component";
import MDL from "../../../MDL";
import SIconApp from "../../../Assets/SIconApp";

type Props = {
  editObject?: any;
  onSuccess?: Function;
};

export default class PopupTag extends Component<Props> {
  form: any;
  state = {
    color: this.props.editObject?.color || this.getRandomColor(),
    nombrePreview: this.props.editObject?.nombre || "",
  };

  // Genera color aleatorio (no negro/blanco puro)
  getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 14) + 1]; // Evita 0 y F en exceso
    }
    return color;
  }

  // Calcula contraste para texto legible
  getContrastColor(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
  }

  handleSubmit = (formData) => {
    const nombre = formData.nombre?.trim();
    if (!nombre) {
      SPopup.alert("El nombre es obligatorio.");
      return;
    }

    const data = {
      ...formData,
      nombre,
      color: this.state.color,
    };

    const { editObject, onSuccess } = this.props;

    const promise = editObject?.key
      ? MDL.inventario.tag.editar({ ...data, key: editObject.key })
      : MDL.inventario.tag.registrar(data);

    promise
      .then((res) => {
        onSuccess?.(res);
        SPopup.close("testPopup_");

      })
      .catch((e) => {
        console.error(e);
        SPopup.alert("Error al guardar la etiqueta.");
      });
  };

  renderColorPreview() {
    const { color, nombrePreview } = this.state;
    const textColor = this.getContrastColor(color);
    const displayName = nombrePreview.trim() || "etiqueta de ejemplo";

    return (
      <SView col={"xs-12"}>
        <SText fontSize={14} color={STheme.color.text} style={{ marginBottom: 8 }}>
          Vista previa
        </SText>
        <SView
          height={40}
          center
          style={{
            backgroundColor: color + "33", // 20% opacidad
            borderRadius: 20,
            borderWidth: 1,
            borderColor: color,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <SText color={STheme.color.text} fontSize={14} bold>
            {/* <SText color={textColor} fontSize={14} bold> */}
            {displayName}
          </SText>
        </SView>
      </SView>
    );
  }

  render() {
    const { editObject } = this.props;

    return (
      <SView col={"xs-12"} center>
        {/* Título */}
        <SText fontSize={20} bold center color={STheme.color.text} style={{ marginBottom: 8 }}>
          {editObject?.key ? "Editar Etiqueta" : "Crear Nueva Etiqueta"}
        </SText>

        <SHr height={16} />

        {/* Formulario */}
        <SForm
          ref={(ref) => (this.form = ref)}
          col={"xs-12"}
          inputs={{
            nombre: {
              label: "Nombre de la etiqueta*",
              type: "text",
              placeholder: "bug, feature, documentación",
              defaultValue: editObject?.nombre ?? "",
              required: true,
              onChangeText: (text) => {
                this.setState({ nombrePreview: text });
              },
            },
            descripcion: {
              label: "Descripción (opcional)",
              type: "text",
              placeholder: "Describe el propósito de esta etiqueta",
              defaultValue: editObject?.descripcion ?? "",
            },
          }}
          onSubmit={this.handleSubmit}
        />

        <SHr height={16} />

        {/* Selector de color */}
        <SView col={"xs-12"}>
          <SText fontSize={14} color={STheme.color.text} style={{ marginBottom: 1 }}> Color </SText>
          <SView row center style={{ gap: 12, alignItems: "center" }}>
            <input
              type="color"
              value={this.state.color}
              onChange={(e) => this.setState({ color: e.target.value })}
              style={{
                width: 66,
                height: 44,
                borderRadius: 2,
                borderWidth: 0,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />



            {/* <SInput
               type="color"
               placeholder="#3b82f6"
               value={this.state.color}
               onChangeText={(val) => {
                 if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                   this.setState({ color: val.toUpperCase() });
                 }
               }}
               style={{ textTransform: "uppercase" }}
             /> */}

            <SView flex>
              <SInput
                type="text"
                placeholder="#3b82f6"
                value={this.state.color}
                onChangeText={(val) => {
                  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    this.setState({ color: val.toUpperCase() });
                  }
                }}
                style={{ textTransform: "uppercase" }}
              />
            </SView>
          </SView>
        </SView>

        <SHr height={24} />

        {/* Vista previa */}
        {this.renderColorPreview()}

        <SHr height={24} />

        {/* Botones de acción */}
        <SView row center style={{ gap: 12, flexWrap: "wrap" }}>
          {!editObject?.quitar && (
            <SView
              center
              height={40}
              style={{
                backgroundColor: STheme.color.danger,
                borderRadius: 12,
                paddingHorizontal: 20,
                minWidth: 100,
              }}
              onPress={() => {
                SPopup.confirm({
                  title: "¿Eliminar etiqueta?",
                  message: `Esto eliminará permanentemente "${editObject.nombre}".`,
                  ok: { label: "Eliminar", color: "#fff" },
                  cancel: { label: "Cancelar" },
                  onPress: () => {
                    MDL.inventario.tag.editar({ key: editObject.key, estado: 0 })
                      .then(() => {
                        this.props.onSuccess?.();
                        SPopup.close("testPopup_")
                      })
                      .catch(() => SPopup.alert("Error al eliminar."));
                  },
                });
              }}
            >
              <SText color="#fff" fontSize={13} bold style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <SIconApp name="Delete" width={16} height={16} /> ELIMINAR
              </SText>
            </SView>
          )}

          {editObject?.quitar && (
            <SView
              center
              height={40}
              style={{
                backgroundColor: STheme.color.danger,
                borderRadius: 12,
                paddingHorizontal: 20,
                minWidth: 100,
              }}
              onPress={() => {
                SPopup.confirm({
                  title: "¿Eliminar etiqueta?",
                  message: `Esto eliminará permanentemente "${editObject.nombre}".`,
                  ok: { label: "Eliminar", color: "#fff" },
                  cancel: { label: "Cancelar" },
                  onPress: () => {

                    const dataaa = {
                      key: editObject.key_modelo_tag,
                      estado: 0
                    }

                    MDL.inventario.modelo_tag.editar(dataaa)
                      .then(() => {
                        this.props.onSuccess?.();
                        SPopup.close("testPopup_")
                      })
                      .catch(() => SPopup.alert("Error al eliminar."));
                  },
                });
              }}
            >
              <SText color="#fff" fontSize={13} bold style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <SIconApp name="Delete" width={16} height={16} /> Quitar TAG
              </SText>
            </SView>
          )}

          <SView
            center
            height={40}
            style={{
              borderWidth: 1.5,
              borderColor: STheme.color.gray,
              borderRadius: 12,
              paddingHorizontal: 20,
              minWidth: 100,
            }}
            onPress={() => SPopup.close("testPopup_")}
          >
            <SText color={STheme.color.text} fontSize={12} bold>
              CANCELAR
            </SText>
          </SView>

          <SView
            center
            height={40}
            style={{
              backgroundColor: STheme.color.success,
              borderColor: STheme.color.gray,
              borderWidth: 1,
              width: 100,
              borderRadius: 8,
              // paddingHorizontal: 20,
              // minWidth: 100,
            }}
            onPress={() => this.form.submit()}
          >
            <SText color="#fff" fontSize={13} bold>
              {editObject?.key ? "GUARDAR" : "CREAR"}
            </SText>
          </SView>
        </SView>

        <SHr height={16} />
      </SView>
    );
  }
}

// === MÉTODO ESTÁTICO MEJORADO ===
PopupTag.open = (params: { editObject?: any; onSuccess?: () => void }) => {
  const key = `testPopup_`;
  SPopup.open({
    key,
    content: (
      <SView
        style={{
          width: "95%",
          maxWidth: 480,
          borderRadius: 24,
          backgroundColor: STheme.color.barColor,
          padding: 24,
          borderWidth: 1,
          borderColor: STheme.color.card,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        }}
        withoutFeedback
      >
        <PopupTag editObject={params.editObject} onSuccess={params.onSuccess} />
      </SView>
    ),
  });
};