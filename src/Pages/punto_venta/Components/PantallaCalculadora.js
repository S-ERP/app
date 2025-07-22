// import React, { Component } from 'react';
// import React from 'react';
import React, { Component, useState } from 'react';
import { SView, SText } from 'servisofts-component';
import TecladoNumerico from './TecladoNumerico';

export default function PantallaCalculadora() {
    const [valor, setValor] = useState("");

    const sumar = () => {
        const total = parseFloat(valor || "0");
        alert("Total sumado: " + total);
        setValor(""); // reiniciar
    };

    return (
        <SView col={"xs-12"} center>
            <SText fontSize={24} bold>Bs {valor || "0"}</SText>

            <TecladoNumerico value={valor} onChange={setValor} />

            <SView
                backgroundColor="#10B981"
                width={200}
                height={50}
                center
                style={{ borderRadius: 8, marginTop: 16 }}
                onPress={sumar}
            >
                <SText bold color="#FFF">Sumar</SText>
            </SView>
        </SView>
    );
}
