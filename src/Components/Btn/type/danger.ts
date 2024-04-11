import { STheme } from "servisofts-component";
import { ButtomType } from "..";

const index = (): ButtomType => {
    return {
        viewProps: {
            height: 40,
            center: true,
            borderRadius: 8,
            style: {
                borderWidth: 1,
                borderColor: STheme.color.danger
            }
        },
        textProps: {
            color: STheme.color.danger,
            fontSize: 18,
            bold: true,
            // style: {
            //     flex: 1,
            // },
        }
    }
}
export default index;