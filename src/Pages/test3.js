import React, { Component } from 'react';
import { SHr, SInput, SNavigation, SPage, SPopup, SText, STheme, SView, } from 'servisofts-component'; import { FlatList } from 'react-native'; import FloatButtom from '../Components/FloatButtom';
import SIconApp from '../Assets/SIconApp';
export default class TagManager extends Component {
  constructor(props) {
    super(props);

    // Etiquetas iniciales ordenadas alfabéticamente
    this.allTags = [
      { nombre: "bug", descripcion: "Informe de un error en el software", color: "#f87171", key_modelo_tag: "tag-1" },
      { nombre: "dependencies", descripcion: "Actualizaciones o cambios en dependencias", color: "#6366f1", key_modelo_tag: "tag-2" },
      { nombre: "design", descripcion: "Cambios o mejoras de diseño UI/UX Cambios o mejoras de diseño UI/UXCambios o mejoras de diseño UI/UXCambios o mejoras de diseño UI/UXCambios o mejoras de diseño UI/UX", color: "#f59e0b", key_modelo_tag: "tag-3" },
      // { nombre: "documentation", descripcion: "Cambios relacionados con la documentación", color: "#fbbf24", key_modelo_tag: "tag-4" },
      // { nombre: "duplicate", descripcion: "Este issue o PR es un duplicado", color: "#facc15", key_modelo_tag: "tag-5" },
      // { nombre: "enhancement", descripcion: "Mejora o optimización existente", color: "#34d399", key_modelo_tag: "tag-6" },
      // { nombre: "feature", descripcion: "Nueva funcionalidad solicitada", color: "#60a5fa", key_modelo_tag: "tag-7" },
      // { nombre: "good first issue", descripcion: "Ideal para nuevos contribuidores", color: "#4ade80", key_modelo_tag: "tag-8" },
      // { nombre: "help wanted", descripcion: "Se busca ayuda con este problema", color: "#a78bfa", key_modelo_tag: "tag-9" },
      // { nombre: "invalid", descripcion: "El reporte no es válido o incompleto", color: "#94a3b8", key_modelo_tag: "tag-10" },
      // { nombre: "performance", descripcion: "Optimizaciones de rendimiento", color: "#10b981", key_modelo_tag: "tag-11" },
      // { nombre: "question", descripcion: "Requiere aclaración o información", color: "#f472b6", key_modelo_tag: "tag-12" },
      // { nombre: "security", descripcion: "Vulnerabilidad o mejora de seguridad", color: "#ef4444", key_modelo_tag: "tag-13" },
      // { nombre: "testing", descripcion: "Cambios o mejoras en pruebas", color: "#38bdf8", key_modelo_tag: "tag-14" },
      // { nombre: "wontfix", descripcion: "El problema no será solucionado", color: "#9ca3af", key_modelo_tag: "tag-15" },
    ].sort((a, b) => a.nombre.localeCompare(b.nombre));

    this.selectedTags = [];
    this.search = "";
  }

  // ---------------------- UTILIDADES ----------------------

  generateRandomColor() {
    const letters = '0123456789ABCDEF';
    return '#' + Array.from({ length: 6 }, () =>
      letters[Math.floor(Math.random() * 16)]
    ).join('');
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  toggleTag(tag) {
    if (this.selectedTags.includes(tag))
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    else this.selectedTags.push(tag);
    this.openTagPopup();

    this.forceUpdate();
  }

  createNewTag() {
    const newTag = { nombre: this.search.trim(), descripcion: "", color: this.generateRandomColor(), key_modelo_tag: this.generateUUID() };

    this.allTags.push(newTag);
    this.allTags.sort((a, b) => a.nombre.localeCompare(b.nombre));
    this.selectedTags.push(newTag);

    this.search = "";
    this.openTagPopup();
    this.forceUpdate();
  }

  // ---------------------- POPUP ----------------------

  openTagPopup() {
    SPopup.open({
      key: "tag-popup",
      content: (
        <SView col="xs-12" center style={{ backgroundColor: STheme.color.background, maxWidth: 340, borderRadius: 8, overflow: "hidden", }} withoutFeedback >

          <SView col="xs-12" center style={{ backgroundColor: STheme.color.background, borderBottomWidth: 1, borderColor: STheme.color.lightGray + "55", paddingVertical: 8, }}>
            <SView col="xs-12" center style={{
              // backgroundColor: STheme.color.primary,


              // borderBottomWidth: 1,
              // borderColor: "pink",
              // borderColor: STheme.color.border,
              // paddingVertical: 8,

            }}>
              <SHr height={8} />
              <SText color={STheme.color.white}>Seleccionar etiquetas</SText>
              <SHr height={8} />
            </SView>

            {/* BUSCADOR */}
            <SView col="xs-11.5" marginVertical={10}>
              <SInput icon={<SIconApp fill={"#b8b9b9"} name='Search' height={16} />} placeholder="Filtrar o crear etiqueta..." value={this.search} style={{ height: 36 }} onChangeText={text => { this.search = text; this.openTagPopup(); }} />
            </SView>
          </SView>

          {/* LISTA */}
          <SView col="xs-12" style={{ minHeight: 140, maxHeight: 320 }}>
            <SHr height={8} />

            <FlatList
              data={this.allTags.filter(tag =>
                tag.nombre.toLowerCase().includes(this.search.toLowerCase())
              )}
              keyExtractor={item => item.key_modelo_tag}
              ItemSeparatorComponent={() => <SHr height={6} />}

              renderItem={({ item: tag, index }) => (
                <SView
                  col="xs-12"
                  key={tag.key_modelo_tag}
                  style={{
                    paddingHorizontal: 14,
                    // borderColor: STheme.color.lightGray + "55",
                  }}
                  onPress={() => this.toggleTag(tag)}
                >
                  <SView row  >
                    {/* Checkbox estilo GitHub */}

                    {/* <SView width={26} row border={"transparent"}>
                      <SInput center type="checkBox" value={this.selectedTags.includes(tag)} style={{ height: 18, width: 18 }}
                        onChangeText={() => {
                          if (!this.selectedTags.includes(tag)) this.selectedTags.push(tag);
                          else this.selectedTags = this.selectedTags.filter(t => t !== tag);
                          this.openTagPopup();
                          this.forceUpdate();
                        }}
                      />
                    </SView> */}


                    <SView width={16} height={16} center style={{ borderWidth: 1, borderColor: STheme.color.text, borderRadius: 2, marginRight: 6, backgroundColor: this.selectedTags.includes(tag) ? "#1975fe" : "transparent", }} >
                      {this.selectedTags.includes(tag) && (
                        <SText color="#fff" bold fontSize={12} >✓</SText>
                      )} </SView>

                    <SView width={20} row border={"transparent"}>

                      <SView
                        width={14}
                        height={14}
                        style={{
                          backgroundColor: tag.color,
                          borderRadius: 15,
                          marginRight: 9,
                        }}
                      />
                    </SView>

                    <SView flex style={{ borderBottomWidth: index !== this.allTags.length - 1 ? 1 : 0, borderColor: STheme.color.lightGray + "55", }}>
                      <SText col={"xs-12"} fontSize={14} numberOfLines={1}>{tag.nombre}</SText>
                      <SText col={"xs-12"} fontSize={11} color={STheme.color.lightGray} numberOfLines={1}> {tag.descripcion} </SText>
                      <SHr height={4}></SHr>
                    </SView>





                    {/* <SView
                      width={14}
                      height={14}
                      style={{
                        backgroundColor: tag.color,
                        borderRadius: 14,
                        marginRight: 10,
                      }}
                    />

                    <SView flex>
                      <SText fontSize={14} bold>{tag.nombre}</SText>
                      <SText fontSize={11} color={STheme.color.lightGray}>
                        {tag.descripcion}
                      </SText>
                    </SView> */}


                    {/* <SView flex>
                      <SView row  >
                        <SView
                          width={14}
                          height={14}
                          style={{
                            backgroundColor: tag.color,
                            borderRadius: 14,
                            marginRight: 8,
                          }}
                        />
                        <SText fontSize={14} bold>{tag.nombre}</SText>
                      </SView>

                      {tag.descripcion ? (
                        <SText
                          fontSize={11}
                          color={STheme.color.lightGray}
                          style={{ marginLeft: 22 }}
                        >
                          {tag.descripcion}
                        </SText>
                      ) : null}
                    </SView> */}

                  </SView>
                </SView>
              )}
              ListFooterComponent={() =>
                this.search &&
                  !this.allTags.some(
                    t => t.nombre.toLowerCase() === this.search.toLowerCase()
                  ) ? (
                  <SView col="xs-11" row style={{ padding: 10, backgroundColor: STheme.color.lightGray + "55", borderRadius: 4, margin: 10, marginTop: 2 }} onPress={() => this.createNewTag()} >
                    {/* <SView col="xs-11" row style={{ padding: 10, backgroundColor: "#313742ff", borderRadius: 4, margin: 10, }} onPress={() => this.createNewTag()} > */}
                    {/* <SView col="xs-11" row style={{ padding: 10, backgroundColor: "#c4d1cc80", borderRadius: 4, margin: 10, }} onPress={() => this.createNewTag()} > */}
                    <SView flex row  >
                      <SText col={"xs-12"} color={STheme.color.lightGray} numberOfLines={4} fontSize={12} >Crear nueva etiqueta “{this.search}” </SText>
                    </SView>
                    <SView width={18} row ><SText fontSize={14} color={STheme.color.lightGray}  >+</SText></SView>

                  </SView>
                ) : null
              }
            />
          </SView>

          {/* PIE */}
          <SView
            col="xs-12"
            center
            style={{
              borderTopWidth: 1,
              borderColor: STheme.color.lightGray + "55",
              paddingVertical: 8,
            }}
          >
            <SText
              fontSize={12}
              color={STheme.color.text}
              onPress={() => {
                SNavigation.navigate("/tag");
                SPopup.close("tag-popup");
              }}
            >
              Editar etiquetas
            </SText>
          </SView>
          {/* </SView> */}
        </SView>
      ),
    });
  }

  // ---------------------- RENDER PRINCIPAL ----------------------

  render() {
    const selectedSorted = [...this.selectedTags].sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );

    return (
      <SPage title="Gestión de Etiquetas" disableScroll>
        <SHr height={20} />
        <SView col="xs-12" center padding={16}>
          <SText bold marginBottom={8}>Etiquetas seleccionadas:</SText>

          <SView
            row
            center
            style={{
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            {selectedSorted.length === 0 ? (
              <SText color="#999">Ninguna</SText>
            ) : (
              selectedSorted.map(tag => (
                <SView
                  key={tag.key_modelo_tag}
                  row
                  center
                  style={{
                    backgroundColor: tag.color,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    gap: 6,
                  }}
                >
                  <SText color="#fff" fontSize={13}>{tag.nombre}</SText>
                  <SText
                    color="#fff"
                    fontSize={16}
                    onPress={() => {
                      this.selectedTags = this.selectedTags.filter(t => t !== tag);
                      this.openTagPopup();

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
