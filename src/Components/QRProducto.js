import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SImage, SPage, SText, SView } from 'servisofts-component';
import Model from '../Model';

class QRProducto extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        this.setState({ loading: true })
        Model.producto.Action.getQR({ key: this.props.pk }).then(e => {
            this.setState({ data: e.data, loading: false })
            console.log(e);
        }).catch(e => {
            this.setState({ loading: false, error: e.error })
            console.error(e);
        })
    }
    render() {
        return (
            <SView width={100} height={100} center {...this.props} card>
                <SImage enablePreview src={"data:image/jpg;base64, " + this.state?.data?.b64} />
            </SView>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(QRProducto);