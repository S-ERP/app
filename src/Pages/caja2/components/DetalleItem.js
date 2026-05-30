import React, { Component } from 'react';
import { View, Linking } from 'react-native';
import {
  SDate, SHr, SIcon, SMath, SNavigation, SText,
  STheme, SView
} from 'servisofts-component';
import MDL from '../../../MDL';
import { Container } from '../../../Components';
import SIconApp from '../../../Assets/SIconApp';
import PopupUploadVoucher from './PopupUploadVoucher';
import SSocket from 'servisofts-socket'; // Asegúrate de importar esto
import { ColorCompraVenta } from '../../../Config/theme';

export default class DetalleItem extends Component<{
  item: any,
  index: number,
  tipo_pago: any,
  empresa: any
}> {




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

    let bgColor = "#B0B0B0";
    let borderColor = "#3c3d3dff";
    let icon = "crmpdarchivo";
    let iconColor = "#3c3d3dff";

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
      icon: { bg: "#E8EAF6", border: "#3F51B5", icon: "icon", color: "#3F51B5" }
    };

    if (tipoMapeo[tipo]) {
      bgColor = tipoMapeo[tipo].bg;
      borderColor = tipoMapeo[tipo].border;
      icon = tipoMapeo[tipo].icon;
      iconColor = tipoMapeo[tipo].color;
    }

    const extensionAlias = {
      "document": "docx",
      "sheet": "xlsx",
      "presentation": "pptx"
    };
    const displayExt = extensionAlias[tipo] || tipo;

    const url = `${SSocket.api.root}empresa/${this.props?.empresa?.key}/voucher/${this.props?.item.key}/${documento_name}?time=${new SDate().toString("yyyy-MM-ddThh:mm")}`;

    return (
      <SView row center style={{
        padding: 4,
        backgroundColor: bgColor,
        borderRadius: 6,
        marginRight: 4,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: borderColor
      }} onPress={() => Linking.openURL(url)}>
        <SIconApp name={icon} fill={iconColor} width={12} height={12} style={{ marginRight: 3 }} />
        <SText fontSize={10} color={iconColor} bold>{documento_name?.substring(0, 7)}.{displayExt}</SText>
        <SIconApp name={"downImgNube"} fill={iconColor} width={12} height={12} style={{ marginLeft: 3 }} />
      </SView>
    );
  }

  botonesVoucher(vouchers = []) {
    if (!Array.isArray(vouchers) || vouchers.length === 0) {
      return null;
      // return (
      //   <View style={{ borderWidth: 1, borderColor: STheme.color.card, padding: 2, borderRadius: 4 }}>
      //     <SText color={STheme.color.lightGray} fontSize={10}>Sin vouchers</SText>
      //   </View>
      // );
    }

    return (
      <SView row flexWrap style={{ paddingVertical: 2 }}>
        {vouchers.slice(0, 4).map((voucher, index) => (
          <SView key={index} style={{ padding: 2 }}>
            {this.iconotipoArchivo(voucher?.name, voucher?.type)}
          </SView>
        ))}
        {vouchers.length > 4 && (
          <SView style={{
            padding: 4,
            backgroundColor: STheme.color.card,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: STheme.color.lightGray,
            marginLeft: 4
          }} onPress={() => {
            PopupUploadVoucher.open(this.props.empresa.key, this.props.item.key, vouchers);
          }}>
            <SText fontSize={10} color={STheme.color.link}>+{vouchers.length - 4}</SText>
          </SView>
        )}
      </SView>
    );
  }

  render() {
    const { item, index, empresa } = this.props;
    const color = item.monto < 0 ? STheme.color.danger : STheme.color.success;
    const moneda = empresa?.monedas?.find(e => e.key === item.key_moneda);

    return (<>
      <SView key={index} row padding={4} style={{
        borderBottomWidth: 1,
        borderColor: STheme.color.card,
        borderRadius: 4,
      }}>
        <SView flex>
          {/* CABECERA */}
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

          {/* INFORMACIÓN */}
          <SView row style={{ alignItems: "center", flexWrap: 'wrap' }}>
            <View style={styles.etiqueta}>
              <SText fontSize={10} color={STheme.color.lightGray}>
                {new SDate(item.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm")}
              </SText>
            </View>
            <SView width={8} />

            <View style={{
              ...styles.etiqueta,
              backgroundColor: `${MDL.caja.detalle_types[item.tipo]?.color}66`,
              borderColor: MDL.caja.detalle_types[item.tipo]?.color
            }}>
              <SText fontSize={10}>
                {MDL.caja.detalle_types[item.tipo]?.label || item.tipo}
              </SText>
            </View>
            <SView width={8} />

            {item.codigo_comprobante &&
              <>
                <View style={styles.etiqueta}>
                  <SText color={STheme.color.link} underLine fontSize={10}
                    onPress={() => SNavigation.navigate("/contabilidad/asiento_contable/profile", { pk: item.key_comprobante })}>
                    {item.codigo_comprobante}
                  </SText>
                </View>
                <SView width={8} />
              </>
            }

            {item?.key_compra_venta &&
              <>
                <SView row style={{
                  borderWidth: 1,
                  borderColor: ColorCompraVenta.venta,
                  padding: 2,
                  borderRadius: 4
                }} backgroundColor={ColorCompraVenta.venta + "50"} >
                  <SIconApp width={13} height={13} name={"ventaCarro"} fill={STheme.color.text} />
                  <SView width={3} />
                  <SText fontSize={10}
                    onPress={() => {
                      if (item.tipo == "compra") {
                        SNavigation.navigate("/venta/profile2", { pk: item?.key_compra_venta })
                      } else if (item.tipo == "venta") {
                        SNavigation.navigate("/venta/profile2", { pk: item?.key_compra_venta })
                      }


                    }}>
                    {item.tipo}
                  </SText>
                </SView>
                <SView width={8} />
              </>
            }
            {item.tipo == "compra" && <>
              <SView row style={{
                borderWidth: 1,
                borderColor: ColorCompraVenta.compra,
                padding: 2,
                borderRadius: 4
              }} backgroundColor={ColorCompraVenta.compra + "50"} >
                <SIconApp width={13} height={13} name={"compraCarro"} fill={STheme.color.text} />
                <SView width={3} />
                <SText fontSize={10}
                  onPress={() => {
                    if (item.tipo == "compra") {
                      SNavigation.navigate("/venta/profile2", { pk: item?.key })
                    } else if (item.tipo == "venta") {
                      SNavigation.navigate("/venta/profile2", { pk: item?.key })
                    }


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


            <SView row flexWrap>
              <SView style={styles.botonSubir} onPress={() =>

                // console.log("miraa " + JSON.stringify(item))

                PopupUploadVoucher.open(empresa.key, item.key, item.vouchers)
              }>
                <SIconApp name='upImgNube' fill={STheme.color.text} width={12} />
                <SView width={4} />
                <SText fontSize={10} color={STheme.color.text}>Subir Vouchers</SText>
              </SView>
              <SView width={4} />
            </SView>

          </SView>
        </SView>



        {/* <SHr h={4} /> */}
      </SView>
      {/* <SView style={{ alignItems: "flex-end" }}> */}
      <SView center style={{ position: "absolute", right: 0, top: 4 }}  >
        <SView center>
          <SText fontSize={18} bold color={color}>
            {moneda?.observacion} {SMath.formatMoney(item.monto)}
          </SText>
        </SView>
      </SView>
    </>

    );
  }
}

// Estilos auxiliares
const styles = {
  etiqueta: {
    borderWidth: 1,
    borderColor: STheme.color.card,
    padding: 2,
    borderRadius: 4
  },
  etiquetaRow: {
    borderWidth: 1,
    borderColor: STheme.color.card,
    padding: 2,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center"
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
    alignItems: "center"
  }
};
