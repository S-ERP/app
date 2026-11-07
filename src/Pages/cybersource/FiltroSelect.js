import React from 'react';
import { SText, STheme, SView } from 'servisofts-component';
import InputSelector from '../../Components/Selectores/InputSelector';

// Selector desplegable con etiqueta flotante, mismo estilo que el "Período" de DateTimeBetween.
// options: [[valor, etiqueta], ...]; el valor "" se usa como "todos".
export default ({ label, options, value = "", onChange, width = 170 }) => <SView style={{ width, position: 'relative', marginTop: 8 }}>
    <SText style={{ position: 'absolute', top: -2, left: 4, zIndex: 1, fontSize: 10, color: STheme.color.lightGray,
        backgroundColor: STheme.color.background + "AA", borderRadius: 4, paddingHorizontal: 4 }}>{label}</SText>
    <SView style={{ height: 36, borderRadius: 2, backgroundColor: STheme.color.card, justifyContent: 'center' }}>
        <InputSelector defaultValue={value || "_todos"} customStyle={"erp"}
            options={options.map(([v, l]) => ({ value: v || "_todos", label: l }))}
            onSelect={(o) => onChange(o.value == "_todos" ? "" : o.value)} />
    </SView>
</SView>
