// UserContext.js
import React, { createContext, useContext, useState } from "react";


type FormContextType = {
    SForm2?: SForm2;
}

type SForm2Props = {
    children?: React.ReactNode;
    onSubmit?: (data: any) => void;
}


const FormContext = createContext<FormContextType>({});

export default class SForm2 extends React.Component<SForm2Props> {


    _inputs: any = {};

    submit() {
        Object.keys(this._inputs).forEach(key => {
            const input = this._inputs[key];
            const value = input.state.value;
            console.log(key, value);
        })
    }
    render() {
        return (
            <FormContext.Provider value={{ SForm2: this }}>
                {this.props.children}
            </FormContext.Provider>
        );
    };
}


export const useSForm2Context = () => useContext(FormContext);