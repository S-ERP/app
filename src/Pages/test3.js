import React, { Component } from 'react';
import {
  SHr, SInput, SNavigation, SPage, SPopup, SText, STheme, SView
} from 'servisofts-component';
import { FlatList } from 'react-native';
import FloatButtom from '../Components/FloatButtom';
import SIconApp from '../Assets/SIconApp';
import MDL from '../MDL';

export default class TagManager extends Component {
  constructor(props) {
    super(props);
    this.allTags = [];
    this.selectedTags = [];
    this.search = "";
  }

  async componentDidMount() {
    await this.loadTags();
  }

  async loadTags() {
    try {
      const response = await MDL.inventario.tag.getAll();
      if (!response) return;
      this.allTags = Object.values(response)
        .filter(t => t.estado !== 0)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      this.forceUpdate();
    } catch (e) {
      console.error("Error cargando etiquetas:", e);
    }
  }

  generateRandomColor() {
    const letters = '0123456789ABCDEF';
    return '#' + Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join('');
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
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

  async createNewTag() {
    const newTag = {
      nombre: this.search.trim(),
      descripcion: "",
      color: this.generateRandomColor(),
    };

    MDL.inventario.tag.registrar(newTag);

    this.allTags.push(newTag);
    this.allTags.sort((a, b) => a.nombre.localeCompare(b.nombre));
    this.selectedTags.push(newTag);
    this.search = "";
    this.openTagPopup();
    this.forceUpdate();
  }

  openTagPopup() {
    const filteredTags = this.allTags.filter(tag =>
      tag.nombre.toLowerCase().includes(this.search.toLowerCase())
    );

    const showCreateButton =
      this.search.trim() !== "" &&
      !this.allTags.some(t => t.nombre.toLowerCase() === this.search.toLowerCase().trim());

    SPopup.open({
      key: "tag-popup",
      content: (
        <SView
          col="xs-12"
          center
          style={{
            backgroundColor: STheme.color.background,
            maxWidth: 340,
            borderRadius: 8,
            overflow: "hidden",
          }}
          withoutFeedback
        >
          {/* Encabezado */}
          <SView
            col="xs-12"
            center
            style={{
              borderBottomWidth: 1,
              borderColor: STheme.color.lightGray + "55",
              paddingVertical: 8,
            }}
          >
            <SText color={STheme.color.white}>Seleccionar etiquetas</SText>
            <SHr height={4} />
            <SView col="xs-11.1">
              <SInput
                icon={<SIconApp fill={"#b8b9b9"} name="Search" height={16} />}
                placeholder="Filtrar o crear etiqueta..."
                value={this.search}
                style={{ height: 36, borderRadius: 4 }}
                onChangeText={(text) => {
                  this.search = text;
                  this.openTagPopup();
                }}
              />
            </SView>
          </SView>

          <SHr height={8} />

          {/* Lista con altura controlada */}
          <SView
            col="xs-12"
            style={{
              // minHeight: 140,
              // maxHeight: 320,
              height: 250,
              paddingHorizontal: 14,
            }}
          >
            {filteredTags.length === 0 && !showCreateButton ? (
              /* Caso: Nada que mostrar */
              <SView col="xs-12" center height={140} style={{ justifyContent: "center" }}>
                <SText color={STheme.color.lightGray} fontSize={14}>
                  No hay etiquetas
                </SText>
              </SView>
            ) : (
              <FlatList
                data={filteredTags}
                keyExtractor={item => item.key_modelo_tag || item.nombre}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: tag, index }) => {
                  const isLastItem = index === filteredTags.length - 1;

                  return (
                    <SView
                      style={{ paddingVertical: 4 }}
                      onPress={() => this.toggleTag(tag)}
                    >
                      <SView row>
                        {/* Checkbox */}
                        <SView
                          width={16}
                          height={16}
                          center
                          style={{
                            borderWidth: 1,
                            borderColor: STheme.color.text,
                            borderRadius: 2,
                            marginRight: 6,
                            backgroundColor: this.selectedTags.includes(tag)
                              ? "#1975fe"
                              : "transparent",
                          }}
                        >
                          {this.selectedTags.includes(tag) && (

                            <SText color={STheme.color.white} bold fontSize={12}>
                              ✓
                            </SText>

                          )}
                        </SView>

                        {/* Color */}
                        <SView width={16} height={16} center style={{ marginRight: 10 }}>
                          <SView
                            width={14}
                            height={14}
                            style={{ backgroundColor: tag.color, borderRadius: 15 }}
                          />
                        </SView>

                        {/* Texto */}
                        <SView
                          flex
                          style={{
                            borderBottomWidth: isLastItem && !showCreateButton ? 0 : 1,
                            borderColor: STheme.color.lightGray + "55",
                            paddingBottom: 8,
                          }}
                        >
                          <SText fontSize={14} numberOfLines={1}>
                            {tag.nombre}
                          </SText>
                          {tag.descripcion ? (
                            <SText fontSize={11} color={STheme.color.lightGray} numberOfLines={1}>
                              {tag.descripcion}
                            </SText>
                          ) : null}
                        </SView>
                      </SView>
                    </SView>
                  );
                }}
                ListFooterComponent={() =>
                  showCreateButton ? (
                    <SView
                      col="xs-12"
                      row
                      style={{
                        padding: 12,
                        backgroundColor: STheme.color.lightGray + "33",
                        borderRadius: 8,
                        marginTop: 8,
                        marginBottom: 4,
                      }}
                      onPress={() => this.createNewTag()}
                    >
                      <SView flex row center>
                        <SText color={STheme.color.primary} fontSize={13}>
                          Crear nueva etiqueta “{this.search.trim()}”
                        </SText>
                      </SView>
                      <SView width={20} center>
                        <SText fontSize={16} bold color={STheme.color.primary}>
                          +
                        </SText>
                      </SView>
                    </SView>
                  ) : (
                    <SHr height={8} />
                  )
                }
              />
            )}
          </SView>

          <SHr height={8} />

          {/* Footer */}
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
        </SView>
      ),
    });
  }

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
            style={{ gap: 8, flexWrap: "wrap", marginBottom: 16 }}
          >
            {selectedSorted.length === 0 ? (
              <SText color={STheme.color.lightGray}>Ninguna</SText>
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
                  <SText color={STheme.color.text} fontSize={13}>{tag.nombre}</SText>
                  <SText
                    color={STheme.color.text}
                    fontSize={16}
                    onPress={() => {
                      this.selectedTags = this.selectedTags.filter(t => t !== tag);
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
