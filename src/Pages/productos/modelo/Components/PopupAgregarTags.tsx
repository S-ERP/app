import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SPopup, SView, SText, SHr, STheme, SInput, SNotification, SNavigation } from 'servisofts-component';
import SIconApp from '../../../../Assets/SIconApp';
import MDL from '../../../../MDL';

export default class PopupAgregarTags extends Component {
  static open(props) {
    SPopup.open({
      key: "PopupAgregarTags",
      content: (
        <SView col="xs-12" center style={{ backgroundColor: STheme.color.background, maxWidth: 340, borderRadius: 8, overflow: "hidden", }} withoutFeedback >
          <PopupAgregarTags
            {...props}
            onChange={(tags) => {
              props.onSuccess?.(tags);
            }}
            onCancel={() => {
              SPopup.close("PopupAgregarTags");
              props.onCancel?.();
            }}
            onSuccess={(tags) => {
              props.onSuccess?.(tags);
            }}
          />
        </SView>
      ),
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
  async componentDidMount() {
    await this.loadTags();
  }
  async loadTags() {
    try {
      const resp = await MDL.inventario.tag.getAll();
      if (!resp) return;
      const tags = Object.values(resp)
        .filter(t => t.estado !== 0)
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      const validSelected = this.state.selectedTags.filter(sel =>
        tags.find(t => t.key === sel.key)
      );
      this.setState({ allTags: tags, selectedTags: validSelected });
    } catch (e) {
      SNotification.send({
        title: "Error",
        body: "No se pudieron cargar las etiquetas.",
        color: STheme.color.danger,
      });
    }
  }
  generateRandomColor() {
    const letters = '0123456789ABCDEF';
    return '#' + Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join('');
  }

  async toggleTag(tag) {
    const { selectedTags: prevSelected } = this.state;
    const exists = prevSelected.some(t => t.key === tag.key);
    let selectedTags = [];
    let dataseleccionado = prevSelected.find(t => t.key === tag.key);
    if (exists) {
      selectedTags = prevSelected.filter(t => t.key !== tag.key);
      this.setState({ selectedTags });
      if (dataseleccionado?.key_modelo_tag) {
        try {
          await MDL.inventario.modelo_tag.editar({
            key: dataseleccionado.key_modelo_tag,
            estado: 0,
          });
          this.props.onSuccess?.(selectedTags)
        } catch (e) {
          SPopup.alert("Error al quitar etiqueta");
        }
      }
    } else {
      selectedTags = [...prevSelected, tag];
      this.setState({ selectedTags });
      try {
        if (dataseleccionado?.key_modelo_tag) {
          await MDL.inventario.modelo_tag.editar({
            key: dataseleccionado.key_modelo_tag,
            estado: 1,
          });
        } else {
          const resp = await MDL.inventario.modelo_tag.registrar({
            key_modelo: this.props.key_modelo,
            key_tag: tag.key,
          });
          tag.key_modelo_tag = resp.key;
        }
        this.props.onSuccess?.(selectedTags);
      } catch (e) {
        SPopup.alert("Error al agregar etiqueta");
      }
    }
    console.log("TODOS LOS TAGS ACTUALES:", selectedTags);
  }

  createNewTag = async () => {
    const { search, allTags } = this.state;
    const nombre = search.trim();

    if (!nombre || allTags.some(t => t.nombre.toLowerCase() === nombre.toLowerCase())) return;

    try {
      const newTag = { nombre, descripcion: "", color: this.generateRandomColor(), };

      const resp = await MDL.inventario.tag.registrar(newTag);
      if (!resp) throw new Error("No response");

      const modeloTagResp = await MDL.inventario.modelo_tag.registrar({ key_modelo: this.props.key_modelo, key_tag: resp.key, });

      resp.key_modelo_tag = modeloTagResp.key;

      const newSelected = [...this.state.selectedTags, resp];

      this.setState({ allTags: [...allTags, resp].sort((a, b) => a.nombre.localeCompare(b.nombre)), selectedTags: newSelected, search: "", });

      this.props.onSuccess?.(newSelected);

    } catch (err) {
      SNotification.send({ title: "Error", body: "No se pudo crear la etiqueta o vincularla al modelo.", color: STheme.color.danger, });
    }
  };

  render() {
    const { allTags, selectedTags, search } = this.state;
    const filteredTags = allTags.filter(tag =>
      tag.nombre.toLowerCase().includes(search.toLowerCase())
    );
    const showCreateButton =
      search.trim() !== "" &&
      !allTags.some(t => t.nombre.toLowerCase() === search.toLowerCase().trim());
    return (
      <>
        <SView col="xs-12" center style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray + "55", paddingVertical: 8, }} >
          <SText color={STheme.color.white}>Seleccionar etiquetas</SText>
          <SHr height={4} />
          <SView col="xs-11.1">
            <SInput
              icon={<SIconApp fill={"#b8b9b9"} name="Search" height={16} />}
              placeholder="Filtrar o crear etiqueta..."
              value={search}
              style={{ height: 36, borderRadius: 4 }}
              onChangeText={text => this.setState({ search: text })}
            />
          </SView>
        </SView>
        <SHr height={8} />

        <SView col="xs-12" style={{ height: 250, paddingHorizontal: 14 }}>
          {filteredTags.length === 0 && !showCreateButton ? (
            <SView col="xs-12" center height={140} style={{ justifyContent: "center" }}>
              <SText color={STheme.color.lightGray} fontSize={14}>
                No hay etiquetas
              </SText>
            </SView>
          ) : (
            <FlatList
              data={filteredTags}
              keyExtractor={item => item.key}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: tag, index }) => {
                const isLastItem = index === filteredTags.length - 1;
                const isSelected = selectedTags.some(t => t.key === tag.key);
                return (
                  <SView style={{ paddingVertical: 4 }} onPress={() => this.toggleTag(tag)}>
                    <SView row>
                      <SView width={16} height={16} center style={{ borderWidth: 1, borderColor: STheme.color.text, borderRadius: 2, marginRight: 6, backgroundColor: isSelected ? "#1975fe" : "transparent", }} >
                        {isSelected && <SText color={STheme.color.white} bold fontSize={12}> ✓ </SText>}
                      </SView>

                      <SView width={16} height={16} center style={{ marginRight: 10 }}>
                        <SView width={14} height={14} style={{ backgroundColor: tag.color, borderRadius: 15 }} />
                      </SView>

                      <SView flex style={{ borderBottomWidth: isLastItem && !showCreateButton ? 0 : 1, borderColor: STheme.color.lightGray + "55", paddingBottom: 8, }} >
                        <SText fontSize={14} numberOfLines={1}>{tag.nombre}</SText>
                        {tag.descripcion && (
                          <SText fontSize={11} color={STheme.color.lightGray} numberOfLines={1}>
                            {tag.descripcion}
                          </SText>
                        )}
                      </SView>
                    </SView>
                  </SView>
                );
              }}
              ListFooterComponent={() =>
                showCreateButton ? (
                  <SView col="xs-12" row style={{ padding: 12, backgroundColor: STheme.color.lightGray + "33", borderRadius: 8, marginTop: 8, marginBottom: 4, }} onPress={this.createNewTag} >
                    <SView flex row center>
                      <SText color={STheme.color.primary} fontSize={13}>
                        Crear nueva etiqueta “{search.trim()}”
                      </SText>
                    </SView>
                    <SView width={20} center>
                      <SText fontSize={16} bold color={STheme.color.primary}>+</SText>
                    </SView>
                  </SView>
                ) : <SHr height={8} />
              }
            />
          )}
        </SView>
        <SHr height={8} />

        <SView col="xs-12" center style={{ borderTopWidth: 1, borderColor: STheme.color.lightGray + "55", paddingVertical: 8, }} >
          <SText fontSize={12} color={STheme.color.text} onPress={() => { SNavigation.navigate("/tag"); SPopup.close("PopupAgregarTags"); }} > Editar etiquetas </SText>
        </SView>
        {/* <SView width={60} height={20} center backgroundColor='red' style={{ position: "absolute", right: 10, bottom: 10, borderTopWidth: 1, borderColor: STheme.color.lightGray + "55", paddingVertical: 8, }} >
          <SText fontSize={7} color={STheme.color.text} onPress={() => this.props.onSuccess?.(selectedTags)} > Save </SText>
        </SView> */}

        <SHr height={4} />

      </>
    );
  }
}