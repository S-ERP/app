import React, { Component } from 'react';
import { SDate, SHr, SInput, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import FloatButtom from '../Components/FloatButtom';
import { FlatList } from 'react-native';

export default class test3 extends Component {
  constructor(props) {
    super(props);

    this.allTags = [

      { nombre: "bug", descripcion: "Informe de un error en el software", color: "#f87171", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba31" },
      { nombre: "feature", descripcion: "Nueva funcionalidad solicitada o planificada", color: "#60a5fa", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba32" },
      { nombre: "documentation", descripcion: "Cambios relacionados con la documentación", color: "#fbbf24", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba33" },
      { nombre: "enhancement", descripcion: "Mejora o optimización de funcionalidades existentes", color: "#34d399", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba34" },
      { nombre: "help wanted", descripcion: "Se busca ayuda con este problema", color: "#a78bfa", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba35" },
      { nombre: "question", descripcion: "Se requiere aclaración o información adicional", color: "#f472b6", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba36" },
      { nombre: "wontfix", descripcion: "El problema no será solucionado por decisión del equipo", color: "#9ca3af", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba37" },
      { nombre: "duplicate", descripcion: "Este issue o PR es un duplicado de otro existente", color: "#facc15", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba38" },
      { nombre: "good first issue", descripcion: "Ideal para nuevos contribuidores", color: "#4ade80", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba39" },
      { nombre: "invalid", descripcion: "El reporte no es válido o carece de información necesaria", color: "#94a3b8", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba40" },
      { nombre: "design", descripcion: "Cambios o mejoras relacionadas con diseño UI/UX", color: "#f59e0b", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba41" },
      { nombre: "testing", descripcion: "Cambios o mejoras en pruebas automatizadas o manuales", color: "#38bdf8", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba42" },
      { nombre: "security", descripcion: "Vulnerabilidad o mejora de seguridad", color: "#ef4444", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba43" },
      { nombre: "performance", descripcion: "Optimizaciones de rendimiento", color: "#10b981", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba44" },
      { nombre: "dependencies", descripcion: "Actualizaciones o cambios en dependencias", color: "#6366f1", key_modelo_tag: "ad660819-59bf-4988-a039-38f6bbe8ba45" }



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



        <SView col={"xs-12"}
          center
          style={{ backgroundColor: STheme.color.gray, maxWidth: 320, borderRadius: 8 }} withoutFeedback >

          <SView col={"xs-12"} center style={{
            borderColor: STheme.color.text, borderWidth: 1,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}>

            <SView col={"xs-11.5"} height={32} row   >
              <SText center fontSize={14} bold>Aplicar etiquetas a este modelo</SText>
            </SView>
            <SHr height={4} />


            <SView col={"xs-11.5"} height={32}  >

              <SInput
                style={{
                  height: 32
                }}
                placeholder="Filtrar etiquetas"
                value={this.search}
                onChangeText={(text) => { this.search = text; this.openTagPopup(); }}
              />
            </SView>
            <SHr height={16} />

          </SView>

          <SView col={"xs-12"} center style={{ borderColor: STheme.color.text, borderWidth: 1, }}>
            <SView col={"xs-11"} style={{ maxHeight: 300, }}  >
              <SHr height={16} />

              <FlatList
                data={this.allTags.filter(tag => tag.nombre.toLowerCase().includes(this.search.toLowerCase()))}
                keyExtractor={(item) => item.key_modelo_tag}
                ItemSeparatorComponent={() => <SHr height={14}
                  style={{
                    width: "100%",
                  }}
                />}
                renderItem={({ item: tag }) => (
                  <SView
                    col={"xs-12"}
                    key={tag.key_modelo_tag}
                    card
                    row

                    // border={"cyan"}
                    // height={150}
                    // height={44}
                    // height={50}
                    style={{ backgroundColor: this.selectedTags.includes(tag) ? 'red' : 'transparent' }}
                    onPress={() => {
                      if (!this.selectedTags.includes(tag)) this.selectedTags.push(tag);
                      else this.selectedTags = this.selectedTags.filter(t => t !== tag);
                      this.openTagPopup()
                      this.forceUpdate();
                    }}
                  >

                    <SView col={"xs-12"} row flex>

                      <SView col={"xs-2.2"} row  >


                        <SView width={27} row border={"transparent"}>
                          <SInput center type="checkBox" value={this.selectedTags.includes(tag)}
                            style={{ height: 18, width: 18 }}
                            onChangeText={() => {
                              if (!this.selectedTags.includes(tag)) this.selectedTags.push(tag);
                              else this.selectedTags = this.selectedTags.filter(t => t !== tag);
                              this.openTagPopup();
                              this.forceUpdate();
                            }}
                          />
                        </SView>

                        <SView width={22} row border={"transparent"}>
                          <SView width={14} height={14} style={{ backgroundColor: tag.color, borderRadius: 14 }} />
                        </SView>

                      </SView>



                      <SView col={"xs-9.5"} row   >

                        <SText col={"xs-12"} color={STheme.color.text} fontSize={14} numberOfLines={1} > {tag.nombre} </SText>
                        <SText col={"xs-12"} color={STheme.color.lightGray} fontSize={11} numberOfLines={1} > {tag.descripcion} </SText>
                        <SHr height={4} />
                        <SView col={"xs-12"} style={{ borderBottomColor: STheme.color.lightGray, borderWidth: 1.5 }} />

                      </SView>

                    </SView>



                  </SView>
                )}
                ListFooterComponent={() => (
                  this.search && !this.allTags.some(t => t.nombre.toLowerCase() === this.search.toLowerCase()) ? (<>
                    {/* <SHr height={14} /> */}

                    <SView col={"xs-12"} row center backgroundColor={STheme.color.card} style={{ borderRadius: 2, marginTop: 8, padding: 8 }}
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
                      <SView col={"xs-11"} row center >
                        <SView flex row  > <SText fontSize={14} col={"xs-12"} numberOfLines={4} >Crear nueva etiqueta "{this.search}"</SText> </SView>
                        <SView width={18} row center  ><SText fontSize={14}>+</SText></SView>
                      </SView>
                    </SView>

                    <SView style={{ borderRadius: 2, marginTop: 8, maxHeight: 300, minHeight: 100 }} />

                  </>

                  ) : null
                )}
              />

              <SHr height={16} />

            </SView>
          </SView>

          <SView col={"xs-12"} style={{ borderColor: STheme.color.text, borderWidth: 1, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, }} >

            <SHr height={4} />
            <SView height={32} center onPress={() => { SNavigation.navigate("/tag"); SPopup.close('tag-popup'); }} >
              <SText fontSize={12} bold>Editar etiquetas</SText>
            </SView>
          </SView>
        </SView>
      )
    });
  }

  generateUUID() {
    // Genera un UUID simple sin librerías
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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
                      // this.openTagPopup()
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
