import React from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import { SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../../MDL";

export default class AjusteTagDropBox extends React.Component<{ style?: ViewStyle, children?: any, onDrop?: (ajuste: any) => void }> {
    onDropListener: any;
    viewRef: View | null = null;
    componentDidMount(): void {
        this.onDropListener = MDL.contabilidad.addEventListener("handleDropAjuste", (evt) => {
            if (!this.viewRef) return;
            this.viewRef.measure((x, y, width, height, pageX, pageY) => {
                const { ajuste, event } = evt;
                if (!event) return;
                const { absoluteX, absoluteY } = event;
                // console.log("AjusteTagDropBox.onDropListener", {
                //     absoluteX,
                //     absoluteY,
                //     pageX,
                //     pageY,
                //     width,
                //     height,
                // });
                if (absoluteX < pageX || absoluteX > pageX + width || absoluteY < pageY || absoluteY > pageY + height) {
                    return; // Drop outside the box
                }
                if (this.props.onDrop) {
                    console.log("AjusteTagDropBox.onDropListener", "Handling drop for ajuste:", ajuste);
                    this.props.onDrop(ajuste);
                }
            })

        })
    }

    componentWillUnmount(): void {
        MDL.contabilidad.removeEventListener(this.onDropListener);
    }

    render() {
        return <View
            ref={ref => this.viewRef = ref}
            style={{
                height: "100%",
                flex: 1,
                ...this.props.style,
            }}>
            {this.props.children}
        </View>
    }
}