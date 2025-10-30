import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SDate, SHr, SInput, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import FloatButtom from '../Components/FloatButtom';

export default class test3 extends Component {
  constructor(props) {
    super(props);
    this.allTags = ["bug", "feature", "documentation", "enhancement", "help wanted"];
    this.selectedTags = [];
    this.search = "";
  }

  openTagPopup() {
    SPopup.open({
      key: "tag-popup",
      content: (
        <SView col={"xs-11 sm-10 md-8"} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 550 }} padding={16} withoutFeedback>
          <SText fontSize={18} bold>Aplicar etiquetas a este producto</SText>
          <SHr height={16} />

          <SInput
            placeholder="Filtrar etiquetas"
            value={this.search}
            onChangeText={(text) => {
              this.search = text;
              this.openTagPopup(); // reabre popup con búsqueda actualizada
            }}
            style={{ marginBottom: 12 }}
          />

          <SView style={{ maxHeight: 300 }}>
            <FlatList
              data={this.allTags.filter(tag => tag.toLowerCase().includes(this.search.toLowerCase()))}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={() => <SHr height={6} />}
              renderItem={({ item: tag }) => (
                <SView
                  key={tag}
                  row
                  height={44}
                  style={{
                    backgroundColor: this.selectedTags.includes(tag) ? '#1d4ed8' : '#ff7300ff',
                    borderRadius: 4,
                    alignItems: 'center',
                    paddingHorizontal: 8
                  }}
                  onPress={() => {
                    if (!this.selectedTags.includes(tag)) this.selectedTags.push(tag);
                    else this.selectedTags = this.selectedTags.filter(t => t !== tag);
                    this.forceUpdate();
                  }}
                >
        <SView col={"xs-11  "} backgroundColor={STheme.color.pink}  >
                  <SInput
                    type="checkBox"
                    center
                    value={this.selectedTags.includes(tag)}
                    onChangeText={() => {
                      if (!this.selectedTags.includes(tag)) this.selectedTags.push(tag);
                      else this.selectedTags = this.selectedTags.filter(t => t !== tag);
                      this.forceUpdate();
                    }}
                  />
                </SView>

                  <SText color={this.selectedTags.includes(tag) ? '#fff' : '#111'} fontSize={14} bold={this.selectedTags.includes(tag)}>
                    {tag}
                  </SText>
                  {this.selectedTags.includes(tag) && <SText style={{ marginLeft: 'auto', color: '#93c5fd' }}>✓</SText>}
                </SView>
              )}
              ListFooterComponent={() => (
                this.search && !this.allTags.some(t => t.toLowerCase() === this.search.toLowerCase()) ? (
                  <SView
                    center
                    height={44}
                    backgroundColor="#ecfdf5"
                    style={{ borderRadius: 12, marginTop: 8 }}
                    onPress={() => {
                      const newTag = this.search.trim();
                      if (newTag && !this.allTags.includes(newTag)) {
                        this.allTags.push(newTag);
                        this.selectedTags.push(newTag);
                      }
                      this.search = "";
                      this.forceUpdate();
                    }}
                  >
                    <SText color="#059669" fontSize={14}>+ Crear nueva etiqueta "{this.search}"</SText>
                  </SView>
                ) : null
              )}
            />
          </SView>

          <SHr height={16} />
          <SView
            height={48}
            backgroundColor="#10b981"
            center
            style={{ borderRadius: 12 }}
            onPress={() => {
              SNavigation.navigate("/tag");
              SPopup.close('tag-popup');
            }}
          >
            <SText color="#fff" bold>Editar etiquetas</SText>
          </SView>
        </SView>
      )
    });
  }

  render() {
    return (
      <SPage title="Turnos y Horarios" disableScroll>
        <SHr height={20} />
        <SView col="xs-12" center padding={16}>
          <SText bold marginBottom={8}>Etiquetas seleccionadas:</SText>
          <FlatList
            data={this.selectedTags}
            horizontal
            keyExtractor={(item) => item}
            ItemSeparatorComponent={() => <SHr width={8} />}
            renderItem={({ item: tag }) => (
              <SView
                row
                center
                style={{
                  backgroundColor: '#3b82f6',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  gap: 6
                }}
              >
                <SText color="#fff" fontSize={13}>{tag}</SText>
                <SText
                  color="#fff"
                  fontSize={16}
                  onPress={() => {
                    this.selectedTags = this.selectedTags.filter(t => t !== tag);
                    this.forceUpdate();
                  }}
                >
                  ×
                </SText>
              </SView>
            )}
          />

          <FloatButtom onPress={() => this.openTagPopup()} />
        </SView>
      </SPage>
    );
  }
}
