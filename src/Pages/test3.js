import React, { Component } from 'react';
import { SDate, SHr, SInput, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import FloatButtom from '../Components/FloatButtom';
import { FlatList } from 'react-native';

export default class test3 extends Component {
  constructor(props) {
    super(props);

    this.allTags = [
      { nombre: "bug", descripcion: "Informe de un error en el software", color: "#f87171", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba31" },
      { nombre: "feature", descripcion: "Solicitud de una nueva funcionalidad", color: "#60a5fa", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba32" },
      { nombre: "documentation", descripcion: "Cambios relacionados con la documentación", color: "#fbbf24", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba33" },
      { nombre: "enhancement", descripcion: "Mejora o optimización de funcionalidades existentes", color: "#34d399", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba34" },
      { nombre: "help wanted", descripcion: "Se busca ayuda con este problema", color: "#a78bfa", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba35" },
    ];

    this.selectedTags = [];
    this.search = "";
  }

 // Función auxiliar para generar un color aleatorio
generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

openTagPopup() {
    SPopup.open({
        key: "tag-popup",
        content: (
            <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 550 }} padding={16} withoutFeedback>
                
                <SView backgroundColor="#0329ffff" height={48} center>
                    <SText fontSize={18} bold>Aplicar etiquetas a este modelo</SText>
                </SView>
                <SHr height={8} />

                <SInput 
                    placeholder="Filtrar etiquetas" 
                    value={this.search} 
                    onChangeText={(text) => { this.search = text; this.openTagPopup(); }} 
                />
                <SHr height={8} />

                <SView style={{ maxHeight: 300 }}>
                    <FlatList
                        data={this.allTags.filter(tag => tag.nombre.toLowerCase().includes(this.search.toLowerCase()))}
                        keyExtractor={(item) => item.key_modelo_tag}
                        ItemSeparatorComponent={() => <SHr height={6} />}
                        renderItem={({ item: tag }) => (
                            <SView
                                col={"xs-12"} 
                                key={tag.key_modelo_tag} 
                                card 
                                row 
                                center 
                                height={44} 
                                style={{ backgroundColor: this.selectedTags.includes(tag) ? 'transparent' : '#fff' }}
                                onPress={() => {
                                    if (!this.selectedTags.includes(tag)) this.selectedTags.push(tag);
                                    else this.selectedTags = this.selectedTags.filter(t => t !== tag);
                                    this.openTagPopup()
                                    this.forceUpdate();
                                }}
                            >
                                {/* Checkbox */}
                                <SInput 
                                    center 
                                    type="checkBox" 
                                    value={this.selectedTags.includes(tag)}
                                    onChangeText={() => {
                                        if (!this.selectedTags.includes(tag)) this.selectedTags.push(tag);
                                        else this.selectedTags = this.selectedTags.filter(t => t !== tag);
                                        this.openTagPopup()
                                        this.forceUpdate();
                                    }}
                                />

                                {/* Círculo del color */}
                                <SView width={16} height={16} style={{ backgroundColor: tag.color, borderRadius: 8, marginLeft: 8 }} />

                                {/* Nombre de la etiqueta */}
                                <SText 
                                    color={this.selectedTags.includes(tag) ? '#000' : '#111'} 
                                    fontSize={14} 
                                    bold={this.selectedTags.includes(tag)}
                                    style={{ marginLeft: 8 }}
                                >
                                    {tag.nombre}
                                </SText>
                            </SView>
                        )}
                        ListFooterComponent={() => (
                            this.search && !this.allTags.some(t => t.nombre.toLowerCase() === this.search.toLowerCase()) ? (
                                <SView 
                                    center 
                                    height={44} 
                                    backgroundColor="#ecfdf5" 
                                    style={{ borderRadius: 12, marginTop: 8 }}
                                    onPress={() => {
                                        const newTag = {
                                            nombre: this.search.trim(),
                                            descripcion: "",
                                            color: this.generateRandomColor(), // color aleatorio
                                            key_modelo_tag: this.generateUUID(),
                                        };
                                        this.allTags.push(newTag);
                                        this.selectedTags.push(newTag);
                                        this.search = "";
                                        this.openTagPopup()
                                        this.forceUpdate();
                                    }}
                                >
                                    <SText color="#059669" fontSize={14}>+ Crear nueva etiqueta "{this.search}"</SText> 
                                </SView>
                            ) : null
                        )}
                    />
                </SView>

                <SHr height={8} />
                <SView 
                    backgroundColor="#0329ffff" 
                    height={48} 
                    center 
                    onPress={() => { SNavigation.navigate("/tag"); SPopup.close('tag-popup'); }} 
                >
                    <SText fontSize={16} bold>Editar etiquetas</SText>
                </SView>
            </SView>
        )
    });
}

  generateUUID() {
    // Genera un UUID simple sin librerías
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  render() {
    return (
      <SPage title="Turnos y Horarios" disableScroll>
        <SHr height={20} />
        <SView col="xs-12" center padding={16}>
          <SText bold marginBottom={8}>Etiquetas seleccionadas:</SText>
          <SView row center style={{ gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {this.selectedTags.length === 0 ? (
              <SText color="#999">Ninguna</SText>
            ) : (
              this.selectedTags.map(tag => (
                <SView
                  key={tag.key_modelo_tag}
                  row
                  center
                  style={{
                    backgroundColor: tag.color,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    gap: 6
                  }}
                >
                  <SText color="#fff" fontSize={13}>{tag.nombre}</SText>
                  <SText
                    color="#fff"
                    fontSize={16}
                    onPress={() => {
                      this.selectedTags = this.selectedTags.filter(t => t !== tag);
                      this.openTagPopup()
                      this.forceUpdate();
                    }}
                  >
                    ×
                  </SText>
                </SView>
              ))
            )}
          </SView>
          <FloatButtom onPress={() => this.openTagPopup()} />
        </SView>
      </SPage>
    );
  }
}
