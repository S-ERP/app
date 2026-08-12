import React, { Component } from 'react';
import { SLoad, SView } from 'servisofts-component';

export default class Container extends Component<{ loading: boolean, flex: any, children?: any }, any> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        if (this.props.loading) return <SLoad />
        const { col, flex, center, children, ...rest } = this.props;
        const innerCol = col || "xs-11 sm-10 md-8 lg-6 xl-4";
        const containerFlex = flex !== undefined ? flex : 1;
        const innerFlex = flex !== undefined ? flex : 1;

        return (
            <SView col={"xs-12"} center flex={containerFlex} {...rest}>
                <SView col={innerCol} center={center} flex={innerFlex}>
                    {children}
                </SView>
            </SView>
        );
    }
}
