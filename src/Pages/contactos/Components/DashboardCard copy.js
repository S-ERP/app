SPopup.confirm({
    title: (
        <SView center style={{
            textAlign: 'center',
            gap: 16,
            // paddingVertical: 24,
            paddingTop: 18,
            paddingBottom: 14,
            paddingHorizontal: 20
        }}>
            {/* HEADER PROFESIONAL */}
            <SView col="xs-12" row style={{
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8
            }}>
                <SView flex> <SText style={{ fontSize: 18, fontWeight: 'bold', color: STheme.color.text }}> Eliminar Contacto </SText> </SView>

                <SView> <SIconApp name="Cerrar" width={10} fill="#9ca3af" onPress={() => SPopup.close('confirm')} /> </SView>
            </SView>

            {/* ÍCONO ALERTA ROJO */}
            <SView style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(220, 38, 38, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <SIconApp name="AlertOutline" width={24} fill="#dc2626" />
            </SView>

            {/* TEXTO PRINCIPAL */}
            <SView style={{ marginBottom: 4 }}> <SText style={{ fontSize: 16, color: STheme.color.text, textAlign: 'center' }}> ¿Estás seguro de que deseas eliminar a </SText> </SView>

            {/* NOMBRE EN ROJO */}
            <SView style={{ marginBottom: 8 }}> <SText style={{ fontSize: 18, fontWeight: 'bold', color: STheme.color.text, textAlign: 'center' }}> {card.nombres} </SText> </SView>

            {/* ADVERTENCIA GRIS */}
            <SText style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}> Esta acción no se podrá deshacer </SText>
        </SView>
    ),



});