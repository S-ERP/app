import React, { Component } from 'react';
// import React from 'react';
import { SView, SText } from 'servisofts-component';

export default function TecladoNumerico({ value = "", onChange }) {
    const botones = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
        [".", "0", "<"],
    ];

    const handlePress = (char) => {
        if (char === "<") {
            onChange(value.slice(0, -1)); // borrar último
        } else {
            onChange(value + char); // agregar número
        }
    };

    return (
        <SView col={"xs-12"} style={{ padding: 8 }}>
            {botones.map((fila, i) => (
                <SView key={i} row center justifyContent='space-around' style={{ marginVertical: 4 }}>
                    {fila.map((char) => (
                        <SView
                            key={char}
                            width={60}
                            height={60}
                            center
                            backgroundColor="#F3F4F6"
                            style={{
                                borderRadius: 12,
                                elevation: 2,
                            }}
                            onPress={() => handlePress(char)}
                        >
                            <SText bold fontSize={20}>{char}</SText>
                        </SView>
                    ))}
                </SView>
            ))}
        </SView>
    );
}
