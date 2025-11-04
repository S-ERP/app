// import React, { Component } from 'react';
// import { FlatList } from 'react-native';
// import {
//   SPopup, SView, SText, SHr, STheme, SInput, SNotification
// } from 'servisofts-component';
// import SIconApp from '../../../../Assets/SIconApp';
// import MDL from '../../../../MDL';



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
            borderColor: STheme.color.lightGray + "55",
            padding: 16
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

      const tags = Object.values(resp)
        .filter(t => t.estado !== 0)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      // Filtrar solo los seleccionados que aún existen
      const validSelected = this.state.selectedTags
        .filter(sel => tags.find(t => t.key === sel.key));

      this.setState({ allTags: tags, selectedTags: validSelected });
    } catch (e) {
      console.error("Error cargando etiquetas:", e);
      SNotification.send({
        title: "Error",
        body: "No se pudieron cargar las etiquetas.",
        color: STheme.color.danger,
      });
    }
  }

  toggleTag = (tag) => {
    this.setState(prev => {
      const exists = prev.selectedTags.some(t => t.key === tag.key);
      const selectedTags = exists
        ? prev.selectedTags.filter(t => t.key !== tag.key)
        : [...prev.selectedTags, tag];
      return { selectedTags };
    });
  };

  createTag = async () => {
    const { search, allTags } = this.state;
    const nombre = search.trim();
    if (!nombre || allTags.some(t => t.nombre.toLowerCase() === nombre.toLowerCase())) return;

    try {
      const newTag = {
        nombre,
        descripcion: "",
        color: this.randomColor(),
      };
      const resp = await MDL.inventario.tag.registrar(newTag);
      if (resp) {
        this.setState({
          allTags: [...allTags, resp].sort((a, b) => a.nombre.localeCompare(b.nombre)),
          selectedTags: [...this.state.selectedTags, resp],
          search: "",
        });
        SNotification.send({
          title: "Etiqueta creada",
          body: `"${resp.nombre}"`,
          color: STheme.color.success,
        });
      }
    } catch (err) {
      SNotification.send({
        title: "Error",
        body: "No se pudo crear la etiqueta.",
        color: STheme.color.danger,
      });
    }
  };

  randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

  render() {
    const { allTags, selectedTags, search } = this.state;
    const filtered = allTags.filter(t =>
      t.nombre.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <>
        <SText fontSize={16} bold center>Seleccionar etiquetas</SText>
        <SHr height={12} />

        <SInput
          icon={<SIconApp name="Search" fill="#aaa" height={16} />}
          placeholder="Buscar o crear..."
          value={search}
          style={{ height: 38 }}
          onChangeText={text => this.setState({ search: text })}
        />

        <SHr height={12} />

        <SView style={{ maxHeight: 280, width: "100%" }}>
          <FlatList
            data={filtered}
            keyExtractor={item => item.key}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <SHr height={6} />}
            renderItem={({ item: tag }) => {
              const isSelected = selectedTags.some(t => t.key === tag.key);
              return (
                <SView
                  row
                  center
                  onPress={() => this.toggleTag(tag)}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: isSelected ? STheme.color.primary + "22" : "transparent",
                    borderWidth: 1,
                    borderColor: isSelected ? STheme.color.primary : STheme.color.lightGray + "55",
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
                      marginRight: 10,
                      backgroundColor: isSelected ? STheme.color.primary : "transparent",
                    }}
                  >
                    {isSelected && <SText color="#fff" bold fontSize={12}>Check</SText>}
                  </SView>

                  <SView width={14} height={14} backgroundColor={tag.color} borderRadius={7} marginRight={10} />

                  <SView flex>
                    <SText fontSize={14} bold>{tag.nombre}</SText>
                    <SText fontSize={10} color={STheme.color.lightGray}>
                      {tag.key.substring(0, 12)}...
                    </SText>
                  </SView>
                </SView>
              );
            }}
            ListFooterComponent={() =>
              search && !allTags.some(t => t.nombre.toLowerCase() === search.toLowerCase()) && (
                <SView
                  row
                  center
                  onPress={this.createTag}
                  style={{
                    padding: 12,
                    backgroundColor: STheme.color.success + "22",
                    borderRadius: 8,
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: STheme.color.success,
                  }}
                >
                  <SText color={STheme.color.success} bold>
                    Crear etiqueta "{search}"
                  </SText>
                </SView>
              )
            }
          />
        </SView>

        <SHr height={16} />
        <SView row center>
          <SView
            flex
            center
            style={{ padding: 12, backgroundColor: STheme.color.danger, borderRadius: 8, marginRight: 6 }}
            onPress={this.props.onCancel}
          >
            <SText color="#fff" bold>Cancelar</SText>
          </SView>
          <SView
            flex
            center
            style={{ padding: 12, backgroundColor: STheme.color.success, borderRadius: 8 }}
            onPress={() => this.props.onSuccess?.(selectedTags)}
          >
            <SText color="#fff" bold>Aceptar</SText>
          </SView>
        </SView>
      </>
    );
  }
}