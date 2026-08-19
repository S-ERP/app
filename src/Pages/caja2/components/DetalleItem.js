import React, { Component } from 'react';

import { Linking, View } from 'react-native';
import {
  SDate, SHr,
  SMath, SNavigation, SNotification, SPopup, SText,
  STheme, SView
} from 'servisofts-component';
import SSocket from 'servisofts-socket';
import SIconApp from '../../../Assets/SIconApp';
import { ColorCompraVenta } from '../../../Config/theme';
import MDL from '../../../MDL';
import PopupUploadVoucher from './PopupUploadVoucher';

export default class DetalleItem extends Component {

  state = {
    anulando: false,
  };

  iconotipoArchivo(documento_name = "", documento_type = "") {
    if (!documento_type) return null;

    const mimeType = documento_type.toLowerCase().trim();

    const tipoMapeoKeys = {
      "application/pdf": "pdf",
      "application/msword": "document",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "document",
      "application/vnd.ms-excel": "sheet",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "sheet",
      "application/vnd.ms-powerpoint": "presentation",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": "presentation",
      "image/png": "png",
      "ico": "icon",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "text/plain": "txt",
      "text/csv": "csv",
      "application/zip": "zip",
      "application/x-rar-compressed": "rar",
      "video/mp4": "mp4",
      "audio/mpeg": "mp3",
    };

    const tipo = tipoMapeoKeys[mimeType] || "file";

    const tipoMapeo = {
      pdf: { bg: "#fdc4c4ff", border: "#D32F2F", icon: "crmpdf", color: "#D32F2F" },
      document: { bg: "#b2dfffff", border: "#1976D2", icon: "crmword", color: "#1976D2" },
      sheet: { bg: "#affab5ff", border: "#388E3C", icon: "crmexcel", color: "#388E3C" },
      presentation: { bg: "#FFF3E0", border: "#F57C00", icon: "crmpresentacion", color: "#F57C00" },
      png: { bg: "#e895f5ff", border: "#8E24AA", icon: "Galeria", color: "#8E24AA" },
      jpg: { bg: "#F3E5F5", border: "#8E24AA", icon: "Galeria", color: "#8E24AA" },
      txt: { bg: "#F1F8E9", border: "#689F38", icon: "crmtxt", color: "#689F38" },
      csv: { bg: "#FFFDE7", border: "#FBC02D", icon: "crmexcel", color: "#FBC02D" },
      zip: { bg: "#E0F7FA", border: "#0097A7", icon: "crmzip", color: "#0097A7" },
      rar: { bg: "#E0F7FA", border: "#0097A7", icon: "crmzip", color: "#0097A7" },
      mp4: { bg: "#FBE9E7", border: "#D84315", icon: "crmpvideo", color: "#D84315" },
      mp3: { bg: "#E8EAF6", border: "#3F51B5", icon: "crmpaudio", color: "#3F51B5" },
      icon: { bg: "#E8EAF6", border: "#3F51B5", icon: "icon", color: "#3F51B5" },
    };

    const style = tipoMapeo[tipo] ?? { bg: "#B0B0B0", border: "#3c3d3dff", icon: "crmpdarchivo", color: "#3c3d3dff" };

    const extensionAlias = { document: "docx", sheet: "xlsx", presentation: "pptx" };
    const displayExt = extensionAlias[tipo] || tipo;

    const empresaKey = this.props?.empresa?.key;
    const itemKey = this.props?.item?.key;
    if (!empresaKey || !itemKey || !SSocket.api?.root) return null;

    const url = `${SSocket.api.root}empresa/${empresaKey}/voucher/${itemKey}/${encodeURIComponent(documento_name)}?time=${new SDate().toString("yyyy-MM-ddThh:mm")}`;

    return (
      <SView row center style={{
        padding: 4,
        backgroundColor: style.bg,
        borderRadius: 6,
        marginRight: 4,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: style.border,
      }} onPress={() => Linking.openURL(url)}>
        <SIconApp name={style.icon} fill={style.color} width={12} height={12} style={{ marginRight: 3 }} />
        <SText fontSize={10} color={style.color} bold>{documento_name?.substring(0, 7)}.{displayExt}</SText>
        <SIconApp name={"downImgNube"} fill={style.color} width={12} height={12} style={{ marginLeft: 3 }} />
      </SView>
    );
  }

  botonesVoucher(vouchers = []) {
    if (!Array.isArray(vouchers) || vouchers.length === 0) return null;

    return (
      <SView row flexWrap style={{ paddingVertical: 2 }}>
        {vouchers.map((voucher, index) => (
          <SView key={index} style={{ padding: 2 }}>
            {this.iconotipoArchivo(voucher?.name, voucher?.type)}
          </SView>
        ))}
      </SView>
    );
  }

  render() {
    const { item, index, empresa, anulado } = this.props;
    if (!item) return null;

    const monto = item.monto ?? 0;
    const color = monto < 0 ? STheme.color.danger : STheme.color.success;
    const moneda = empresa?.monedas?.find(e => e.key === item.key_moneda);
    const detalleTipo = MDL.caja.detalle_types?.[item.tipo];
    const esAnulacion = item.tipo === "anulacion_venta" || item.tipo === "anulacion_compra" || item.tipo === "amortizacion_anulada" || item.tipo === "reversion_amortizacion";
    const esVenta = item.tipo === "venta";
    const puedeAnular = !esAnulacion && !anulado && (esVenta
      ? MDL.rolesPermisos.getPermiso({ url: "/empresa/punto_venta", permiso: "anular_venta" })
      : MDL.rolesPermisos.getPermiso({ url: "/compra", permiso: "anular_compra" }));
    const esAmortizacion = item.tipo === "amortizacion_compra" || item.tipo === "amortizacion_venta";
    const puedeAnularAmortizacion = esAmortizacion && !anulado && (
      MDL.rolesPermisos.getPermiso({ url: "/empresa/punto_venta", permiso: "anular_venta" })
      || MDL.rolesPermisos.getPermiso({ url: "/compra", permiso: "anular_compra" })
    );
    const fechaStr = item.fecha_on
      ? new SDate(item.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm")
      : "—";

    return (<>
      <SView key={index} row padding={4} style={{
        borderBottomWidth: 1,
        borderColor: STheme.color.card,
        borderRadius: 4,
        opacity: anulado ? 0.45 : 1,
      }}>
        <SView flex>
          <SView row style={{ alignItems: "center" }}>
            <SView style={{
              width: 20, height: 20, borderRadius: 100, backgroundColor: STheme.color.card
            }} center>
              <SText color={STheme.color.lightGray} fontSize={10}>{index}</SText>
            </SView>
            <SView width={4} />
            <SText>{item.descripcion}</SText>
          </SView>

          <SHr h={4} />

          <SView row style={{ alignItems: "center", flexWrap: 'wrap' }}>
            <View style={styles.etiqueta}>
              <SText fontSize={10} color={STheme.color.lightGray}>{fechaStr}</SText>
            </View>
            <SView width={8} />

            <View style={{
              ...styles.etiqueta,
              backgroundColor: detalleTipo ? `${detalleTipo.color}66` : "transparent",
              borderColor: detalleTipo?.color ?? STheme.color.card,
            }}>
              <SText fontSize={10}>{detalleTipo?.label || item.tipo}</SText>
            </View>
            <SView width={8} />

            {item.codigo_comprobante && <>
              <View style={styles.etiqueta}>
                <SText color={STheme.color.link} underLine fontSize={10}
                  onPress={() => SNavigation.navigate("/contabilidad/asiento_contable/profile", { pk: item.key_comprobante })}>
                  {item.codigo_comprobante}
                </SText>
              </View>
              <SView width={8} />
            </>}

            {item?.key_compra_venta && <>
              <SView row style={{
                borderWidth: 1,
                borderColor: ColorCompraVenta.venta,
                padding: 2,
                borderRadius: 4,
              }} backgroundColor={ColorCompraVenta.venta + "50"}>
                <SIconApp width={13} height={13} name={"ventaCarro"} fill={STheme.color.text} />
                <SView width={3} />
                <SText fontSize={10} onPress={() => {
                  SNavigation.navigate("/venta/profile2", { pk: item.key_compra_venta });
                }}>
                  {item.tipo}
                </SText>
              </SView>
              <SView width={8} />
            </>}
            {item?.key_compra_venta && puedeAnular && <>
              <SView row style={{ borderWidth: 1, borderColor: STheme.color.danger, padding: 2, borderRadius: 4, opacity: this.state.anulando ? 0.5 : 1 }}
                backgroundColor={STheme.color.danger + "30"}
                onPress={() => {
                  if (this.state.anulando) return;
                  SPopup.confirm({
                    title: esVenta ? "Anular venta" : "Anular compra",
                    message: `¿Está seguro de que desea anular esta ${esVenta ? "venta" : "compra"}? Esta acción no se puede deshacer.`,
                    onPress: () => {
                      const notificationKey = `anular_${item.key_compra_venta}`;
                      this.setState({ anulando: true });
                      SNotification.send({ key: notificationKey, title: esVenta ? "Anulando venta..." : "Anulando compra...", type: "loading" });
                      const promesa = esVenta
                        ? MDL.caja.anular_venta({ key_compra_venta: item.key_compra_venta })
                        : MDL.caja.anular_compra({ key_compra_venta: item.key_compra_venta });
                      promesa
                        .then(() => {
                          this.setState({ anulando: false });
                          SNotification.send({ key: notificationKey, title: esVenta ? "Venta anulada" : "Compra anulada", body: `La ${esVenta ? "venta" : "compra"} se anuló correctamente.`, color: STheme.color.success });
                        })
                        .catch((error) => {
                          this.setState({ anulando: false });
                          SNotification.send({ key: notificationKey, title: "Error al anular", body: error?.error || error?.message || String(error), color: STheme.color.danger });
                        });
                    }
                  });
                }}>
                <SIconApp width={13} height={13} name={"cancelado"} fill={STheme.color.danger} />
                <SView width={3} />
                <SText fontSize={10} color={STheme.color.danger}>{esVenta ? "Anular venta" : "Anular compra"}</SText>
              </SView>
              <SView width={8} />
            </>}
            {puedeAnularAmortizacion && <>
              <SView row style={{ borderWidth: 1, borderColor: STheme.color.danger, padding: 2, borderRadius: 4, opacity: this.state.anulando ? 0.5 : 1 }}
                backgroundColor={STheme.color.danger + "30"}
                onPress={() => {
                  if (this.state.anulando) return;
                  SPopup.confirm({
                    title: "Anular amortización",
                    message: "¿Está seguro de que desea anular esta amortización? El saldo pendiente volverá a incrementarse. Esta acción no se puede deshacer.",
                    onPress: () => {
                      const notificationKey = `anular_amortizacion_${item.key}`;
                      this.setState({ anulando: true });
                      SNotification.send({ key: notificationKey, title: "Anulando amortización...", type: "loading" });
                      MDL.caja.anular_amortizacion({ key_caja_detalle: item.key })
                        .then(() => {
                          this.setState({ anulando: false });
                          SNotification.send({ key: notificationKey, title: "Amortización anulada", body: "La amortización se anuló correctamente.", color: STheme.color.success });
                        })
                        .catch((error) => {
                          this.setState({ anulando: false });
                          SNotification.send({ key: notificationKey, title: "Error al anular", body: error?.error || error?.message || String(error), color: STheme.color.danger });
                        });
                    }
                  });
                }}>
                <SIconApp width={13} height={13} name={"cancelado"} fill={STheme.color.danger} />
                <SView width={3} />
                <SText fontSize={10} color={STheme.color.danger}>Anular amortización</SText>
              </SView>
              <SView width={8} />
            </>}
            {item.tipo === "compra" && <>
              <SView row style={{
                borderWidth: 1,
                borderColor: ColorCompraVenta.compra,
                padding: 2,
                borderRadius: 4,
              }} backgroundColor={ColorCompraVenta.compra + "50"}>
                <SIconApp width={13} height={13} name={"compraCarro"} fill={STheme.color.text} />
                <SView width={3} />
                <SText fontSize={10} onPress={() => {
                  SNavigation.navigate("/compra/profile", { pk: item.key_compra_venta ?? item.key });
                }}>
                  {item.tipo}
                </SText>
              </SView>
              <SView width={8} />
            </>}

            <View style={styles.etiquetaRow}>
              <SView width={16} height={16}>
                {this.props.tipo_pago?.[item.key_tipo_pago] &&
                  <SIconApp name={this.props.tipo_pago[item.key_tipo_pago].icon} />
                }
              </SView>
              <SView width={4} />
              <SText color={STheme.color.lightGray} fontSize={10}>
                {this.props.tipo_pago?.[item.key_tipo_pago]?.descripcion || item.key_tipo_pago}
              </SText>
            </View>
            <SView width={8} />

            <View style={styles.etiquetaRow}>
              <SText color={STheme.color.lightGray} fontSize={10}>
                {item.empresa_tipo_pago?.descripcion}
              </SText>
            </View>
            <SView width={8} />

            <SView row style={{ alignItems: "center" }}>
              {this.botonesVoucher(item.vouchers)}
            </SView>

            <SView row flexWrap style={{ opacity: this.props.soloLectura ? 0.35 : 1 }}>
              <SView style={styles.botonSubir} onPress={this.props.soloLectura ? undefined : () => {
                if (empresa?.key && item?.key) {
                  PopupUploadVoucher.open(empresa.key, item.key, item.vouchers ?? []);
                }
              }}>
                <SIconApp name='upImgNube' fill={STheme.color.text} width={12} />
                <SView width={4} />
                <SText fontSize={10} color={STheme.color.text}>Subir Vosuchers</SText>
              </SView>
              <SView width={4} />
            </SView>
          </SView>
        </SView>
      </SView>

      <SView center style={{ position: "absolute", right: 0, top: 4, opacity: anulado ? 0.45 : 1 }}>
        <SView center>
          <SText fontSize={18} bold color={color}>
            {moneda?.observacion} {SMath.formatMoney(monto, 5)}
          </SText>
        </SView>
      </SView>
    </>);
  }
}

const styles = {
  etiqueta: {
    borderWidth: 1,
    borderColor: STheme.color.card,
    padding: 2,
    borderRadius: 4,
  },
  etiquetaRow: {
    borderWidth: 1,
    borderColor: STheme.color.card,
    padding: 2,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  botonSubir: {
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: STheme.color.card,
    backgroundColor: STheme.color.card,
    padding: 4,
    marginRight: 2,
    marginBottom: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
};
