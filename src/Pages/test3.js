import React, { Component } from 'react';
// import { View, Text, FlatList } from 'react-native';
import { SDate, SHr, SInput, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import FloatButtom from '../Components/FloatButtom';
import { FlatList } from 'react-native';
// import DiaItem from './DiaItem';
// import TurnoComponent from '.';
// import MDL from '../../MDL';

export default class test3 extends Component {
  constructor(props) {
    super(props);
    // Variables globales dentro de la clase
    this.allTags = ["bug", "feature", "documentation", "enhancement", "help wanted"];
    this.selectedTags = [];
    this.search = "";
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

          <SInput placeholder="Filtrar etiquetas" value={this.search} onChangeText={(text) => { this.search = text; this.openTagPopup(); }} />
          <SHr height={8} />

          <SView style={{ maxHeight: 300 }}>
            <FlatList
              data={this.allTags.filter(tag => tag.toLowerCase().includes(this.search.toLowerCase()))}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={() => <SHr height={6} />}

              renderItem={({ item: tag }) => (
                <SView
                  col={"xs-12"} key={tag} card row center height={44} style={{ backgroundColor: this.selectedTags.includes(tag) ? 'transparent' : '#fd9946ff', }}
                  onPress={() => {
                    if (!this.selectedTags.includes(tag)) this.selectedTags.push(tag);
                    else this.selectedTags = this.selectedTags.filter(t => t !== tag);
                    this.openTagPopup();
                    this.forceUpdate();
                  }}
                >
                  <SView width={32} backgroundColor={STheme.color.pink} center row border={"green"}>
                    <SInput center type="checkBox" value={this.selectedTags.includes(tag)}
                      onChangeText={() => {
                        if (!this.selectedTags.includes(tag)) this.selectedTags.push(tag);
                        else this.selectedTags = this.selectedTags.filter(t => t !== tag);
                        this.openTagPopup();
                        this.forceUpdate();
                      }}
                    /> </SView>

                  <SView width={32}  center row border={"green"}>

                  <SView center width={14} height={14} style={{ backgroundColor: "green", borderRadius:24 }}/>
                   </SView>



                  <SView flex backgroundColor={STheme.color.pink} row border={"pink"}>
                    <SText center color={this.selectedTags.includes(tag) ? '#fff' : '#111'} fontSize={14} bold={this.selectedTags.includes(tag)}> {tag} </SText>
                    {/* {this.selectedTags.includes(tag) && <SText style={{ marginLeft: 'auto', color: '#93c5fd' }}>✓</SText>} */}
                  </SView>

                </SView>
              )}
              ListFooterComponent={() => (
                this.search && !this.allTags.some(t => t.toLowerCase() === this.search.toLowerCase()) ? (
                  <SView center height={44} backgroundColor="#ecfdf5" style={{ borderRadius: 12, marginTop: 8 }}
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
                    <SText color="#059669" fontSize={14}>+ Crear nueva etiqueta "{this.search}"</SText> </SView>) : null)}
            />
          </SView>

          <SHr height={8} />

          <SView backgroundColor="#0329ffff" height={48} center onPress={() => { SNavigation.navigate("/tag"); SPopup.close('tag-popup'); }} >
            <SText fontSize={16} bold>Editar etiquetas</SText>
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
          <SView row center style={{ gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {this.selectedTags.length === 0 ? (
              <SText color="#999">Ninguna</SText>
            ) : (
              this.selectedTags.map(tag => (
                <SView
                  key={tag}
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
              ))
            )}
          </SView>

          <FloatButtom onPress={() => this.openTagPopup()} />
        </SView>
      </SPage>
    );
  }
}
