import { FileChooserProps } from "./type";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pickMultiple } from "react-native-document-picker"
export default async (props: FileChooserProps) => {
    console.log("native")
    return new Promise((resolve, reject) => {
        pickMultiple({
            allowMultiSelection: true,
            
        }).then(e=>{
            resolve(e);
            console.log(e);
        }).catch(e=>{
            console.log(e);
        })
        return;
        launchImageLibrary({
            mediaType: "mixed"
        }, ({ assets, didCancel, errorCode, errorMessage }) => {
            console.log(didCancel, errorCode)
            if (didCancel || errorCode) {
                reject(errorMessage)
                return;
            }
            if (assets) {
                const arr = assets.map(a => {
                    return {
                        ...a,
                        size: a.fileSize,
                        name: a.fileName
                    }

                })
                resolve(arr)
            }

        });
    })

}