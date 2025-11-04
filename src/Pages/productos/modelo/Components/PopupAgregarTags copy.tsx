import React, { Component } from 'react';
import { FlatList } from 'react-native';
import {
  SPopup, SView, SText, SHr, STheme, SInput, SNotification
} from 'servisofts-component';
import SIconApp from '../../../../Assets/SIconApp';
import MDL from '../../../../MDL';

export default class PopupAgregarTags extends Component {
  static open(props) {
    SPopup.open({
      key: "PopupAgregarTags",
      content: (
        <SView
          col="xs-12"
          center
          style={{
            backgroundColor: STheme.color.background,
            maxWidth: 380,
            borderRadius: 8,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: STheme.color.lightGray + "55"
          }}
          withoutFeedback
        >
          <PopupAgregarTags
            {...props}
            onCancel={() => {
              SPopup.close("PopupAgregarTags");
              props.onCancel?.();
            }}
            onSuccess={(tags) => {
              SPopup.close("PopupAgregarTags");
              props.onSuccess?.(tags);
            }}
          />
        </SView>
      )
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      allTags: [],
      selectedTags: props.selectedTags || [],
      search: "",
    };
  }

  componentDidMount() {
    this.loadTags();
  }

  async loadTags() {
    try {
      const resp = await MDL.inventario.tag.getAll();
      if (!resp) return;
      const tags = Object.values(resp).filter(t => t.estado !== 0);

      // mantener los seleccionados si aún existen
      const updatedSelected = this.state.selectedTags
        .map(sel => tags.find(t => t.key === sel.key))
        .filter(Boolean);

      this.setState({ allTags: tags, selectedTags: updatedSelected });
    } catch (e) {
      console.error("Error cargando etiquetas:", e);
      SNotification.send({
        title: "Error",
        body: "No se pudieron cargar las etiquetas.",
        color: STheme.color.danger,
      });
    }
  }

  toggleTag(tag) {
    this.setState(prev => {
      const exists = prev.selectedTags.some(t => t.key === tag.key);
      const selectedTags = exists
        ? prev.selectedTags.filter(t => t.key !== tag.key)
        : [...prev.selectedTags, tag];
      return { selectedTags };
    });
  }

  async createTag() {
    const { search, allTags } = this.state;
    const nombre = search.trim();
    if (!nombre) return;

    try {
      const newTag = {
        nombre,
        descripcion: "",
        color: this.generateRandomColor(),
      };
      const resp = await MDL.inventario.tag.registrar(newTag);
      if (resp) {
        this.setState({
          allTags: [...allTags, resp],
          selectedTags: [...this.state.selectedTags, resp],
          search: "",
        });
        SNotification.send({
          title: "Etiqueta creada",
          body: `Se agregó "${resp.nombre}"`,
          color: STheme.color.success,
        });
      }
    } catch (err) {
      console.error("Error creando etiqueta:", err);
      SNotification.send({
        title: "Error",
        body: "No se pudo crear la etiqueta.",
        color: STheme.color.danger,
      });
    }
  }

  generateRandomColor() {
    const letters = '0123456789ABCDEF';
    return '#' + Array.from({ length: 6 }, () =>
      letters[Math.floor(Math.random() * 16)]
    ).join('');
  }

  render() {
    const { allTags, selectedTags, search } = this.state;
    const filtered = allTags.filter(t =>
      t.nombre.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <SView col="xs-12" center padding={16}>
        <SText fontSize={16} bold>Agregar etiquetas</SText>
        <SHr height={10} />

        <SInput
          icon={<SIconApp fill={"#b8b9b9"} name="Search" height={16} />}
          placeholder="Buscar o crear etiqueta..."
          value={search}
          style={{ height: 36, width: "100%" }}
          onChangeText={(text) => this.setState({ search: text })}
        />

        <SHr height={10} />

        <FlatList
          data={filtered}
          keyExtractor={item => item.key}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <SHr height={6} />}
          renderItem={({ item: tag }) => {
            const selected = selectedTags.some(t => t.key === tag.key);
            return (
              <SView
                col="xs-12"
                row
                onPress={() => this.toggleTag(tag)}
                style={{
                  padding: 6,
                  borderBottomWidth: 1,
                  borderColor: STheme.color.lightGray + "33",
                  alignItems: "center",
                }}
              >
                <SView
                  width={16}
                  height={16}
                  center
                  style={{
                    borderWidth: 1,
                    borderColor: STheme.color.text,
                    borderRadius: 2,
                    marginRight: 6,
                    backgroundColor: selected
                      ? STheme.color.primary
                      : "transparent",
                  }}
                >
                  {selected && (
                    <SText color={STheme.color.white} bold fontSize={12}>✓</SText>
                  )}
                </SView>
                <SView flex>
                  <SText>{tag.nombre}</SText>
                </SView>
              </SView>
            );
          }}
          ListFooterComponent={() =>
            search &&
            !allTags.some(t => t.nombre.toLowerCase() === search.toLowerCase()) && (
              <SView
                col="xs-12"
                row
                center
                onPress={() => this.createTag()}
                style={{
                  padding: 10,
                  backgroundColor: STheme.color.lightGray + "22",
                  borderRadius: 6,
                  marginTop: 10,
                }}
              >
                <SText>➕ Crear etiqueta "{search}"</SText>
              </SView>
            )
          }
        />

        <SHr height={16} />
        <SView row col="xs-12" center>
          <SView
            flex
            style={{
              padding: 10,
              backgroundColor: STheme.color.danger,
              borderRadius: 6,
              marginRight: 6,
            }}
            onPress={this.props.onCancel}
          >
            <SText color={STheme.color.white} center>Cancelar</SText>
          </SView>

          <SView
            flex
            style={{
              padding: 10,
              backgroundColor: STheme.color.success,
              borderRadius: 6,
            }}
            onPress={() => this.props.onSuccess?.(selectedTags)}
          >
            <SText color={STheme.color.white} center>Aceptar</SText>
          </SView>
        </SView>
      </SView>
    );
  }
}
