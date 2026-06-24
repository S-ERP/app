import React, { Component } from "react";
import { Linking, ScrollView } from "react-native";
import {
    SView,
    SText,
    STheme,
    SHr,
    SImage,
    SPopup,
} from "servisofts-component";
import SSocket from "servisofts-socket";
import { SDate } from "servisofts-component";

type Props = {
    key_empresa: string;
    key_caja_detalle: string;
    data_vouchers?: any[];
};

export default class PopupSeeVoucher extends Component<Props> {
    static open(key_empresa: string, key_caja_detalle: string, data_vouchers?: any[]) {
        const key = `PopupSeeVoucher_`;
        SPopup.open({
            key,
            content: (
                <SView
                    style={{
                        width: "100%",
                        maxHeight: "100%",
                        maxWidth: 500,
                        borderRadius: 10,
                        borderColor: STheme.color.card,
                        borderWidth: 1,
                        backgroundColor: STheme.color.background,
                        padding: 16,
                    }}
                    withoutFeedback
                >
                    <PopupSeeVoucher
                        key_empresa={key_empresa}
                        key_caja_detalle={key_caja_detalle}
                        data_vouchers={data_vouchers}
                    />
                </SView>
            ),
        });
    }

    renderVouchers() {
        const { data_vouchers = [], key_empresa, key_caja_detalle } = this.props;
        if (!data_vouchers.length) {
            return (
                <SText center color={STheme.color.text}>
                    No hay vouchers disponibles.
                </SText>
            );
        }

        return (
            <SView>
                <SText bold color={STheme.color.text}>
                    📁 Vouchers adjuntos
                </SText>
                <SHr h={10} />
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 10 }}
                >
                    {data_vouchers.map((v, i) => {
                        const url = `${SSocket.api.root}empresa/${key_empresa}/voucher/${key_caja_detalle}/${encodeURIComponent(v.name)}?time=${new SDate().toString("yyyy-MM-ddThh:mm")}`;
                        const esPDF = v.type === "application/pdf";
                        return (
                            <SView
                                key={i}
                                onPress={() => Linking.openURL(url)}
                                style={{
                                    width: 120,
                                    height: 120,
                                    marginRight: 10,
                                    borderRadius: 10,
                                    overflow: "hidden",
                                    borderWidth: 1,
                                    borderColor: STheme.color.card,
                                    backgroundColor: STheme.color.card,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {esPDF ? (
                                    <SView center style={{ padding: 8 }}>
                                        <SText fontSize={36}>📄</SText>
                                        <SHr h={4} />
                                        <SText fontSize={9} center numberOfLines={2} color={STheme.color.text}>{v.name}</SText>
                                        <SHr h={4} />
                                        <SText fontSize={9} color={STheme.color.link}>Abrir PDF</SText>
                                    </SView>
                                ) : (
                                    <SImage src={url} style={{ width: "100%", height: "100%" }} />
                                )}
                            </SView>
                        );
                    })}
                </ScrollView>
            </SView>
        );
    }

    render() {
        return (
            <SView col={"xs-12"} padding={12}>
                <SText fontSize={18} bold center color={STheme.color.text}>
                    👁️ Ver vouchers
                </SText>
                <SHr h={12} />
                {this.renderVouchers()}
                <SHr h={20} />
            </SView>
        );
    }
}
