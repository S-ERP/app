import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SImage, SLoad, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
export type FavoritoPropsType = {
    data: any
}
class index extends Component<FavoritoPropsType> {
    constructor(props) {
        super(props);
        this.state = {
            isFavorito: false,
            size: 40,
            scale: 0.5,
            loading: false,
        };
    }

    componentDidMount() {
        // console.log("entro askdas")
    }

    render() {
        if (!Model.usuario.Action.getKey()) return null;
        var favoritos = Model.favorito.Action.getAll({
            key_usuario: Model.usuario.Action.getKey()
        })
        if (!this.props.data) return null;

        let isFavorito = false;
        if (favoritos) {
            var fav = Object.values(favoritos).find(obj => obj.key_restaurante == this.props.data.key && obj.estado != 0);
            if (fav) {
                isFavorito = fav;
            }
        }
        // if (!this.state.loading) {

        //     if (favoritos) {


        //         this.state.loading = true;
        //         this.setState({ ...this.state })
        //     }
        // }

        return <SView
            key={this.props.data.key}
            {...this.props}
            center
            onPress={() => {

                console.log("asdad")
                if (this.state.loading) return;
                this.setState({ loading: true })

                if (!isFavorito) {
                    Model.favorito.Action.registro({
                        data: {
                            key_restaurante: this.props.data.key,
                            key_usuario: Model.usuario.Action.getKey(),
                        },
                        key_usuario: Model.usuario.Action.getKey(),
                    }).then(resp => {
                        this.setState({ loading: false })
                        console.log("entro");
                    }).catch(e => {
                        console.log("entro errror");
                        this.setState({ loading: false })
                    })
                } else {
                    Model.favorito.Action.editar({
                        data: {
                            ...isFavorito,
                            estado: 0,
                        },
                        key_usuario: Model.usuario.Action.getKey(),
                    }).then(resp => {
                        console.log("entro");
                        this.setState({ loading: false })
                    }).catch(e => {
                        console.log("entro errror");
                        this.setState({ loading: false })
                    })
                }
            }}
            style={{
                width: this.state.size,
                height: this.state.size,
                borderRadius: 1000, overflow: 'hidden', backgroundColor: 'white',
                borderColor: "#AAAAAA22",
                borderWidth: 2,
                // padding: this.state.size / 6,
                paddingTop: 2,
                borderTopWidth: 0,
                borderBottomWidth: 3,
                ...this.props?.style
            }}>
            {this.state.loading ? <SLoad /> : <SIcon name={"Favorite"} width={this.state.size * this.state.scale} height={this.state.size * this.state.scale} fill={!isFavorito ? "#ADB5BD" : '#FA4A0C'} />}
        </SView>
    }
}
// export default (index);
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);