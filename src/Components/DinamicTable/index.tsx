import React from "react";
import { SView, SText, SHr } from "servisofts-component";

type DinamicTableProps = {
    data?: any[],
    header?: { key: string; label: string }[]
}

export default function DinamicTable({ data = [], header = [] }: DinamicTableProps) {
    return (
        <SView col={"xs-12"} card padding={8}>
            
            <SHr />
            {header.length > 0 && (
                <SView row style={{ borderBottomWidth: 1, paddingBottom: 4 }}>
                    {header.map(h => (
                        <SView flex center key={h.key}>
                            <SText bold>{h.label}</SText>
                        </SView>
                    ))}
                </SView>
            )}
            {data.length > 0 ? (
                data.map((row, i) => (
                    <SView row key={i} style={{ paddingVertical: 4 }}>
                        {header.map(h => (
                            <SView flex center key={h.key}>
                                <SText>{row[h.key]}</SText>
                            </SView>
                        ))}
                    </SView>
                ))
            ) : (
                <SView center col={"xs-12"} height={50}>
                    <SText color="#999">No hay datos</SText>
                </SView>
            )}
        </SView>
    );
}
