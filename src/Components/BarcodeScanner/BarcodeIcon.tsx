import React from "react";
import { SPage, SText, STheme, SView } from "servisofts-component";
import BarcodeScanner from ".";
import SIconApp from "../../Assets/SIconApp";
import { ViewStyle } from "react-native";
import MDL from "../../MDL";

type Props = {
    style?: ViewStyle,
    onChange?: (val: string) => void,

}
export default class BarcodeIcon extends React.Component<Props> {
    qr_reader_listener: any;
    componentDidMount(): void {
        this.qr_reader_listener = MDL.qr_reader.addEventListener("read", (data: any) => {
            if (this.props.onChange) {
                this.props.onChange(data.data);
            }
        })
    }

    componentWillUnmount(): void {
        if (this.qr_reader_listener) {
            MDL.qr_reader.removeEventListener(this.qr_reader_listener);
        }
    }
    render() {
        return <SView style={{
            width: 40, height: 40,
            padding: 6,
            backgroundColor: STheme.color.card,
            ...(this.props.style ?? {})
        }} center onPress={() => {
            BarcodeScanner.open({
                onRead: (val: string) => {
                    // if (this.form) {
                    //     this.form.setValues({
                    //         "barcode": val
                    //     });
                    // }
                    if (this.props.onChange) {
                        this.props.onChange(val);
                    }
                    BarcodeScanner.close();
                }
            })
            // MDL.qr_reader.handleRead("barcode");
        }}>
            <SIconApp name='barcode' fill={STheme.color.lightGray} />
        </SView>
    }
}