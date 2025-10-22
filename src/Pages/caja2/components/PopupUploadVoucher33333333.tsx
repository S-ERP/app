import React, { Component } from "react";
import { Linking, ScrollView } from "react-native";
import {
  SForm,
  SHr,
  SImage,
  SLoad,
  SNotification,
  SPopup,
  SText,
  STheme,
  SView,
  Upload,
} from "servisofts-component";
import SSocket from "servisofts-socket";
import Btn from "../../empresa/config/Components/Btn";
import MDL from "../../../MDL";
import { SDate } from "servisofts-component";
import SIconApp from "../../../Assets/SIconApp";

type Props = {
  key_empresa: string;
  key_caja_detalle: string;
  data_vouchers?: any[];
  onSuccess?: (resp: any) => void;
};

type VoucherFile = {
  file?: File;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  url?: string;
};

export default class PopupUploadVoucher extends Component<Props> {
  static open(key_empresa: string, key_caja_detalle: string, data_vouchers?: any[]) {
    const key = `PopupUploadVoucher_`;
    SPopup.open({
      key,
      content: (
        <SView
          style={{
            width: "100%",
            maxHeight: "90%",
            maxWidth: 500,
            borderRadius: 12,
            borderColor: STheme.color.card,
            borderWidth: 1,
            backgroundColor: STheme.color.background,
            padding: 16,
          }}
          withoutFeedback
        >
          <PopupUploadVoucher
            key_empresa={key_empresa}
            key_caja_detalle={key_caja_detalle}
            data_vouchers={data_vouchers}
          />
        </SView>
      ),
    });
  }

  form: SForm | null = null;
  files: File[] = [];

  state = {
    loading: false,
    uploadedVouchers: this.props.data_vouchers ?? [],
    fileValue: [],
  };

  componentDidMount() {
    this.validateFileEmpty();
  }

  validateFileEmpty = () => {
    return this.state.fileValue.length === 0;
  };

  isFileValid = (file: File) => {
    const isImageOrPDF = file.type.startsWith("image/") || file.type === "application/pdf";
    const isSizeOk = file.size <= 10 * 1024 * 1024;
    return isImageOrPDF && isSizeOk;
  };

  handleFileChange = (e: any) => {
    const nuevos = Array.isArray(e) ? e.flat() : [];
    const nuevosArchivos = nuevos
      .filter((item) => this.isFileValid(item.file))
      .map((item) => ({
        file: item.file,
        name: item.file.name,
        type: item.file.type,
        size: item.file.size,
        lastModified: item.file.lastModified,
        url: URL.createObjectURL(item.file),
      }));

    const actualesServidor = this.state.uploadedVouchers.filter((v) => !v.file);
    const fusionados: VoucherFile[] = [...actualesServidor];

    nuevosArchivos.forEach((nuevo) => {
      if (!fusionados.find((f) => f.name === nuevo.name && f.size === nuevo.size)) {
        fusionados.push(nuevo);
      }
    });

    const nombresActuales = nuevosArchivos.map((n) => n.name);
    const filtrados = fusionados.filter((f) => (f.file ? nombresActuales.includes(f.name) : true));

    this.files = nuevosArchivos.map((n) => n.file);
    this.setState({ uploadedVouchers: filtrados, fileValue: nuevos });
  };

  removeVoucher = (index: number) => {
    const updated = [...this.state.uploadedVouchers];
    const removed = updated.splice(index, 1);
    this.setState({ uploadedVouchers: updated });

    if (removed[0]?.file) {
      this.files = this.files.filter((f) => f.name !== removed[0].file?.name);
    }

    if (updated.filter((v) => v.file).length === 0) {
      this.setState({ fileValue: [] });
    }

    SNotification.send({
      title: "Comprobante eliminado",
      body: "El comprobante se eliminó correctamente.",
      color: STheme.color.info,
      time: 1500,
    });
  };

  handleSubmit = async () => {
    try {
      this.setState({ loading: true });

      const nuevosArchivos = this.state.uploadedVouchers.filter((v) => v.file);
      for (const v of nuevosArchivos) {
        const uploadUrl = `${SSocket.api.root}upload/empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${v.name}`;
        await Upload.sendPromise({ file: v.file!, compress: false }, uploadUrl);
      }

      const vouchersFinales = this.state.uploadedVouchers.map((v) => ({
        name: v.name,
        type: v.type,
        size: v.size,
        lastModified: v.lastModified,
      }));

      const payload = {
        key_empresa: this.props.key_empresa,
        key: this.props.key_caja_detalle,
        vouchers: vouchersFinales,
      };

      const resp = await MDL.caja.editar_detalle(payload);

      SNotification.send({
        title: "Comprobantes guardados",
        body: "Los comprobantes de pago se guardaron correctamente.",
        color: STheme.color.success,
        time: 2500,
      });

      if (this.props.onSuccess) this.props.onSuccess(resp);
      SPopup.close("PopupUploadVoucher_");
    } catch (error) {
      console.error("Error al guardar comprobantes:", error);
      SNotification.send({
        title: "Error al guardar",
        body: "No se pudieron guardar los comprobantes. Por favor, intenta nuevamente.",
        color: STheme.color.danger,
        time: 3000,
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  limpiarTodosLosVouchers = () => {
    this.files = [];
    this.setState({ uploadedVouchers: [], fileValue: [] }, () => {
      SNotification.send({
        title: "Comprobantes eliminados",
        body: "Todos los comprobantes fueron eliminados correctamente.",
        color: STheme.color.info,
        time: 1500,
      });
      this.handleSubmit();
    });
  };

  renderUploadedVouchers() {
    const { uploadedVouchers } = this.state;
    if (!uploadedVouchers.length) return null;

    return (
      <SView>
        <SView
          row
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 6,
            paddingHorizontal: 2,
          }}
        >
          <SView>
            <SText fontSize={14} bold color={STheme.color.text}>
              Comprobantes adjuntos
            </SText>
            <SHr h={2} />
            <SText fontSize={11} color={STheme.color.lightGray}>
              {uploadedVouchers.length} {uploadedVouchers.length === 1 ? "archivo" : "archivos"}
            </SText>
          </SView>

          <SView
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: "#dc3545",
              borderRadius: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            }}
            onPress={() => {
              SPopup.confirm({
                title: "Eliminar todos los comprobantes",
                message:
                  "¿Estás seguro de eliminar todos los comprobantes de pago? Esta acción no se puede deshacer.",
                onPress: () => {
                  this.limpiarTodosLosVouchers();
                },
              });
            }}
          >
            <SText color="#fff" fontSize={13} bold>
              Eliminar todos
            </SText>
          </SView>
        </SView>
        <SHr h={12} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -4, maxHeight: 120 }}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {uploadedVouchers.map((v, i) => {
            const url =
              v.url ??
              `${SSocket.api.root}empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${v.name}?time=${new SDate().toString(
                "yyyy-MM-ddThh:mm"
              )}`;
            const esImagen = v.type?.startsWith("image/");

            return (
              <SView
                key={i}
                style={{
                  width: 100,
                  height: 110,
                  marginRight: 10,
                  borderRadius: 8,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: STheme.color.card,
                  backgroundColor: STheme.color.card,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                }}
              >
                {esImagen ? (
                  <SImage src={url} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <SView flex center style={{ backgroundColor: STheme.color.card, padding: 6 }}>
                    <SText fontSize={28}>📄</SText>
                    <SHr h={6} />
                    <SText fontSize={9} center numberOfLines={2} color={STheme.color.text}>
                      {v.name}
                    </SText>
                  </SView>
                )}

                <SView
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "#dc3545",
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                  }}
                  onPress={() => this.removeVoucher(i)}
                >
                  <SText color="#fff" fontSize={14} bold>
                    ✕
                  </SText>
                </SView>

                <SView
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    backgroundColor: "#28a745",
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                  }}
                  onPress={() => Linking.openURL(url)}
                >
                  <SText color="#fff" fontSize={12}>
                    ⬇
                  </SText>
                </SView>
              </SView>
            );
          })}
        </ScrollView>
        <SHr h={14} />
      </SView>
    );
  }

  renderFileEmptyMessage() {
    if (!this.validateFileEmpty()) return null;

    return (
      <SView
        height={140}
        style={{
          position: "absolute",
          width: "90%",
          top: 200,
          borderRadius: 8,
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: "#4786b1",
        }}
        pointerEvents="auto"
        backgroundColor="rgba(71, 134, 177, 0.08)"
        onPress={() => {
          const form = this.form;
          if (form && form.inputs?.file?.input) {
            const inputElement = form.inputs.file.input;
            if (inputElement.click) inputElement.click();
          } else {
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) input.click();
          }
        }}
      >
        <SView col={"xs-12"} row center flex>
          <SView center>
            <SView
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#4786b1",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
            >
              <SIconApp name="confirmar" height={20} />
            </SView>
            <SHr h={12} />
            <SText center fontSize={13} bold color={STheme.color.text}>
              Arrastra tus archivos aquí
            </SText>
            <SHr h={4} />
            <SText center fontSize={12} color={STheme.color.lightGray}>
              o haz clic para seleccionar
            </SText>
            <SHr h={8} />
            <SText fontSize={10} color={STheme.color.lightGray}>
              PDF, JPG, PNG • Máximo 10MB
            </SText>
          </SView>
        </SView>
      </SView>
    );
  }

  render() {
    return (
      <SView col={"xs-12"} padding={3}>
        <SView center>
          <SText fontSize={18} bold color={STheme.color.text}>
            Gestión de Comprobantes
          </SText>
          <SHr h={4} />
          <SText fontSize={12} center color={STheme.color.lightGray}>
            Adjunta los comprobantes de pago de esta transacción
          </SText>
        </SView>
        <SHr h={14} />

        <ScrollView style={{ width: "100%", maxHeight: 400 }}>
          {this.renderUploadedVouchers()}

          <SView>
            <SText fontSize={14} bold color={STheme.color.text}>
              Agregar nuevos comprobantes
            </SText>
            <SHr h={6} />
            <SText fontSize={11} color={STheme.color.lightGray}>
              Puedes seleccionar múltiples archivos a la vez
            </SText>
            <SHr h={10} />
          </SView>

          <SForm
            ref={(ref) => (this.form = ref)}
            inputs={{
              file: {
                label: "",
                type: "files",
                style: {
                  minHeight: 140,
                  borderWidth: 2,
                  borderColor: STheme.color.card,
                  borderRadius: 8,
                  borderStyle: "dashed",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: STheme.color.background,
                  paddingVertical: 10,
                },
                placeholder: "📎 Selecciona o arrastra tus comprobantes aquí",
                onChangeText: this.handleFileChange,
              },
            }}
            onSubmit={this.handleSubmit}
          />

          {/* {this.renderFileEmptyMessage()} */}
        </ScrollView>

        <SHr h={18} />

        <SView
          row
          col={"xs-12"}
          center
          style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: STheme.color.card }}
        >
          <Btn type="secondary" label="CANCELAR" onPress={() => SPopup.close("PopupUploadVoucher_")} />
          <SView width={10} />
          <Btn
            type="primary"
            label={this.state.loading ? "GUARDANDO..." : "GUARDAR COMPROBANTES"}
            onPress={() => this.form?.submit()}
          />
        </SView>

        {this.state.loading && (
          <SView
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 12,
            }}
          >
            <SLoad />
            <SHr h={12} />
            <SText color="#fff" fontSize={14} bold>
              Guardando comprobantes...
            </SText>
            <SHr h={4} />
            <SText color="#fff" fontSize={11} center style={{ opacity: 0.8 }}>
              Por favor espera un momento
            </SText>
          </SView>
        )}
      </SView>
    );
  }
}
