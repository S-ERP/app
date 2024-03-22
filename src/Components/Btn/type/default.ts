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
                borderColor: STheme.color.text
            }
        },
        textProps: {
            color: STheme.color.text,
            fontSize: 18,
            // bold: true,
            // width: "100%",
            // style: {
            //     flex: 1,
            // },
        }
    }
}
export default index;