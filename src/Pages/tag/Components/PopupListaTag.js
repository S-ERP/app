import React, { Component } from "react";
import { SPopup, SText, SView, SHr, SInput, SIcon, STheme } from "servisofts-component";
import MDL from "../../../MDL";
import SIconApp from "../../../Assets/SIconApp";

export default class PopupListaTag extends Component {
  static open(props) {
    SPopup.open({
      key: "popupSelectTag_",
      title: "Seleccionar etiquetas",
      content: <PopupListaTag {...props} />,
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      allTags: [],
      selectedTags: props.selectedTags ?? [],
      search: "",
    };
  }

  async componentDidMount() {
    const allTags = await MDL.inventario.tag.getAll();
    this.setState({ allTags });
  }

  toggleTag(tag) {
    const { selectedTags } = this.state;
    const isSelected = selectedTags.some((t) => t.key === tag.key);

    const newSelected = isSelected
      ? selectedTags.filter((t) => t.key !== tag.key)
      : [...selectedTags, tag];

    this.setState({ selectedTags: newSelected }, () => {
      this.props.onChange?.(newSelected);
    });
  }

  renderTagItem(tag) {
    const isSelected = this.state.selectedTags.some(t => t.key === tag.key);
    const backgroundColor = isSelected ? tag.color + "33" : STheme.color.card;
    const borderColor = tag.color;
    const textColor = isSelected ? STheme.color.text : STheme.color.textGray;

    return (
      <SView
        key={tag.key}
        row
        center
        style={{
          borderRadius: 20,
          borderWidth: 1,
          borderColor,
          backgroundColor,
          paddingHorizontal: 8,
          paddingVertical: 4,
          margin: 4,
        }}
        onPress={() => this.toggleTag(tag)}
      >
        <SIcon name={isSelected ? "CheckboxOn" : "CheckboxOff"} width={14} fill={borderColor} />
        <SView width={4} />
        <SText color={textColor} fontSize={12}>{tag.nombre}</SText>
      </SView>
    );
  }

  render() {
    const { allTags, search } = this.state;
    const filteredTags = allTags.filter(tag =>
      tag.nombre.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <SView col="xs-12" center>
        <SInput
          placeholder="Buscar etiqueta..."
          value={search}
          onChangeText={v => this.setState({ search: v })}
        />
        <SHr height={8} />
        <SView
          col="xs-12"
          style={{
            maxHeight: 320,
            borderTopWidth: 1,
            borderColor: STheme.color.lightGray,
          }}
        >
          <SView row flex wrap>
            {filteredTags.map(tag => this.renderTagItem(tag))}
          </SView>
        </SView>

        <SHr height={12} />
        <SView
          row
          center
          style={{
            borderTopWidth: 1,
            borderColor: STheme.color.lightGray,
            paddingTop: 8,
          }}
          onPress={() => {
            SPopup.close("popupSelectTag_");
            PopupTag.open({
              editObject: null,
              onSuccess: () => {
                MDL.inventario.tag.getAll().then(allTags => {
                  this.setState({ allTags });
                });
              },
            });
          }}
        >
          <SIconApp name="Add" fill={STheme.color.primary} width={18} />
          <SView width={4} />
          <SText color={STheme.color.primary}>Crear nueva etiqueta</SText>
        </SView>
      </SView>
    );
  }
}
