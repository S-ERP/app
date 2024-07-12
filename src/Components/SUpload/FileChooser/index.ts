// @ts-nocheck

import { FileChooserProps } from "./type";

export default async (props: FileChooserProps) => {
    return new Promise((resolve, reject) => {
        let id = "input_submit";
        const doc: Document = document;
        let input = doc.getElementById(id) as HTMLInputElement;
        
        if (!input) {
            input = doc.createElement("input");
            input.id = id;
        }
        
        input.type = "file";
        input.accept = props.accept ?? "*/*";
        input.multiple = props.multiple;
        input.hidden = true;

        const handleChange = (e: Event) => {
            resolve(input.files);
            cleanup();
        };

        // const handleFocusOut = (e: Event) => {
        //     // Check if no files were selected
        //     if (input.files.length === 0) {
        //         reject(new Error("File selection was canceled"));
        //     }
        //     cleanup();
        // };

        const cleanup = () => {
            input.removeEventListener("change", handleChange);
        };

        input.addEventListener("change", handleChange);

        input.click();
    });
};
