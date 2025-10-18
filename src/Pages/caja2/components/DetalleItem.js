import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import { Container } from '../../../Components';
import SelectTipoPago from './SelectTipoPago';
import SIconApp from '../../../Assets/SIconApp';
import TotalTipoPago from './TotalTipoPago';
import PopupUploadVoucher from './PopupUploadVoucher';


export default class DetalleItem extends Component<{ item: any, index: number, tipo_pago: any, empresa: any }> {


    iconotipoArchivo(documento_name = "", documento_type = "") {
        if (!documento_type) return null;

        const tipo = documento_type.toLowerCase().trim();

        const extension = (() => {
            const parts = tipo.split(/[/\.]/);
            return parts[parts.length - 1] || "";
        })();



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
            jpeg: { bg: "#F3E5F5", border: "#8E24AA", icon: "Galeria", color: "#8E24AA" },
            "x-icon": { bg: "#ECEFF1", border: "#607D8B", icon: "crmpdarchivo", color: "#607D8B" },
            txt: { bg: "#F1F8E9", border: "#689F38", icon: "crmtxt", color: "#689F38" },
            csv: { bg: "#FFFDE7", border: "#FBC02D", icon: "crmexcel", color: "#FBC02D" },
            zip: { bg: "#E0F7FA", border: "#0097A7", icon: "crmzip", color: "#0097A7" },
            rar: { bg: "#E0F7FA", border: "#0097A7", icon: "crmzip", color: "#0097A7" },
            mp4: { bg: "#FBE9E7", border: "#D84315", icon: "crmpvideo", color: "#D84315" },
            mp3: { bg: "#E8EAF6", border: "#3F51B5", icon: "crmpaudio", color: "#3F51B5" }
        };

        const config = tipoMapeo[extension];
        if (config) {
            bgColor = config.bg;
            borderColor = config.border;
            icon = config.icon;
            iconColor = config.color;
        }

        const extensionAlias = {
            "document": "docx",
            "sheet": "xlsx",
            "presentation": "pptx"
        };
        const displayExt = extensionAlias[extension] || extension;

        return (
            <SView row center style={{ padding: 4, backgroundColor: bgColor, borderRadius: 6, marginRight: 4, marginBottom: 4, borderWidth: 1, borderColor: borderColor }} >
                <SIconApp name={icon} fill={iconColor} width={12} height={12} style={{ marginRight: 3 }} />
                <SText fontSize={10} color={iconColor} bold>Voucher.{displayExt}</SText>
                <SIconApp name={"downImgNube"} fill={iconColor} width={12} height={12} style={{ marginLeft: 3 }} />
            </SView>
        );
    }


    botonesVoucher(vouchers = []) {
        if (!Array.isArray(vouchers) || vouchers.length === 0) {
            return (
                <View style={{ borderWidth: 1, borderColor: STheme.color.card, padding: 2, borderRadius: 4 }}>
                    <SText color={STheme.color.lightGray} fontSize={10}>Sin vouchers</SText>
                </View>
            );
        }

        return (
            <SView row flexWrap style={{ paddingVertical: 2 }}>
                {vouchers.slice(0, 4).map((voucher, index) => (
                    <SView key={index} style={{ padding: 2 }}>
                        {this.iconotipoArchivo(voucher.name, voucher.type)}
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
        let color = STheme.color.success;
        if (item.monto < 0) {
            color = STheme.color.danger;
        }
        const moneda = empresa?.monedas?.find(e => e.key === item.key_moneda);
        return <SView key={index} row padding={4} style={{
            borderBottomWidth: 1,
            borderColor: STheme.color.card,
            // backgroundColor: STheme.color.background,
            borderRadius: 4,
        }}>

            <SView flex>
                <SView row style={{
                    alignItems: "center"
                }}>

                    <SView style={{
                        width: 20,
                        height: 20,
                        borderRadius: 100,
                        backgroundColor: STheme.color.card,
                    }} center>
                        <SText color={STheme.color.lightGray} fontSize={10} >{index}</SText>
                    </SView>
                    <SView width={4} />
                    <SText > {item.descripcion}</SText>

                </SView>
                <SHr h={4} />
                <SView row style={{
                    alignItems: "center"
                }}>
                    <View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText fontSize={10} color={STheme.color.lightGray}>{new SDate(item.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm")}</SText>
                    </View>
                    <SView width={8} />
                    <View style={{
                        backgroundColor: MDL.caja.detalle_types[item.tipo]?.color + "66" || STheme.color.card,
                        borderWidth: 1,
                        borderColor: MDL.caja.detalle_types[item.tipo]?.color || STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText fontSize={10} >  {MDL.caja.detalle_types[item.tipo]?.label || item.tipo}</SText>
                    </View>
                    <SView width={8} />
                    {item.codigo_comprobante && <><View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText color={STheme.color.link} underLine fontSize={10} onPress={() => {
                            SNavigation.navigate("/contabilidad/asiento_contable/profile", { pk: item.key_comprobante })
                        }}>{item.codigo_comprobante}</SText>
                    </View>
                        <SView width={8} />
                    </>}
                    {item?.data?.key_compra_venta && <><View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText fontSize={10} onPress={() => {
                            SNavigation.navigate("/compra/profile", { pk: item?.data?.key_compra_venta })
                        }}>{"Compra"}</SText>
                    </View>
                        <SView width={8} />
                    </>}
                    <View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4,
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                        <SView width={16} height={16}>
                            {this?.props?.tipo_pago?.[item.key_tipo_pago] && <SIconApp name={this?.props?.tipo_pago?.[item.key_tipo_pago].icon} />}
                        </SView>
                        <SView width={4} />
                        <SText color={STheme.color.lightGray} fontSize={10}>{this?.props?.tipo_pago?.[item.key_tipo_pago]?.descripcion || item.key_tipo_pago}</SText>
                    </View>



                    <SView width={8} />
                    <View style={{ borderWidth: 1, borderColor: STheme.color.card, padding: 2, borderRadius: 4, flexDirection: "row", alignItems: "center" }}>

                        {/* <SView width={16} height={16}> */}
                        {/* {this?.props?.tipo_pago?.[item.key_tipo_pago] && <SIconApp name={this?.props?.tipo_pago?.[item.key_tipo_pago].icon} />} */}
                        {/* </SView> */}
                        {/* <SView width={4} /> */}

                        <SText color={STheme.color.lightGray} fontSize={10}>{item.empresa_tipo_pago?.descripcion}</SText>
                        {/* <SText color={STheme.color.lightGray} fontSize={10}>{item.key_punto_venta_tipo_pago}</SText> */}
                    </View>
                    <SView width={8} />





                    {/* <SView row center style={{ padding: 4, backgroundColor: bgColor, borderRadius: 6, marginRight: 4, marginBottom: 4, borderWidth: 1, borderColor: borderColor }} > */}


                    {/* justifyContent: "space-between", */}
                    <SView row flexWrap style={{ paddingVertical: 2 }}>
                        <SView style={{ justifyContent: "space-between", borderWidth: 1, borderColor: STheme.color.card, backgroundColor: STheme.color.card, padding: 4, marginRight: 2, marginBottom: 4, borderRadius: 6, flexDirection: "row", alignItems: "center" }} row center onPress={() => PopupUploadVoucher.open(empresa.key, item.key, item.vouchers)} >
                            <SIconApp name='upImgNube' fill={STheme.color.text} width={12} />
                            <SView width={4} />
                            <SText fontSize={10} color={STheme.color.text} >Subir Vouchers</SText>
                        </SView>
                        <SView width={4} />
                    </SView>



                    <SView row style={{ alignItems: "center" }}>
                        {/* <SView width={8} /> */}
                        {this.botonesVoucher(item.vouchers)}
                        {/* <SView width={8} /> */}
                    </SView>


                    {/* <SView width={140} style={{ justifyContent: "space-between", color: STheme.color.text, margin: 5, backgroundColor: STheme.color.card, paddingHorizontal: 10, height: 30, borderRadius: 40 }}
                        onPress={() =>
                            PopupUploadVoucher.open(empresa.key, item.key, item.vouchers)
                        } row center>

                        <SIconApp name='upImgNube' fill={STheme.color.background} width={18} />

                        <SText>Subir Voucher</SText>
                    </SView> */}


                </SView>
            </SView>
            <SView style={{
                alignItems: "flex-end"
            }}>
                <SView center>
                    <SText fontSize={18} bold color={color}>{moneda?.observacion} {SMath.formatMoney(item.monto)}</SText>
                    {/* <SView width={4} /> */}
                    {/* <SView width={120} style={{ justifyContent: "space-between", color: STheme.color.text, margin: 5, backgroundColor: STheme.color.card, paddingHorizontal: 6, height: 30, borderRadius: 40 }}
                        onPress={() =>
                            PopupUploadVoucher.open(empresa.key, item.key, item.vouchers)
                        } row center>

                        <SIconApp name='upImgNube' fill={STheme.color.text} width={16} />

                        <SText fontSize={10} color={STheme.color.text} >Subir Vouchers</SText>
                    </SView> */}


                </SView>

                {/* <SText color={STheme.color.lightGray} fontSize={10}>{this?.state?.tipo_pago?.[item.key_tipo_pago]?.descripcion || item.key_tipo_pago}</SText> */}
                {/* <SView width={4} />
                    <SView width={16} height={16}>
                        {this?.state?.tipo_pago?.[item.key_tipo_pago] && <SIconApp name={this?.state?.tipo_pago?.[item.key_tipo_pago].icon} />}
                    </SView> */}

            </SView>
            <SHr h={4} />

        </SView>

    }

}