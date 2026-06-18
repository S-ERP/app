import React from "react";
import { SForm } from "servisofts-component";
import { SMoneyInput } from "./SInput2";

export type SForm2Props = React.ComponentProps<typeof SForm>;

export default class SForm2 extends React.Component<SForm2Props> {
    private _form: SForm | null = null;

    getValues() { return this._form?.getValues(); }
    setValues(obj: any) { this._form?.setValues(obj); }
    focus(name: string) { this._form?.focus(name); }
    submit() { this._form?.submit(); }

    private processInputs(inputs: Record<string, any>) {
        const result: Record<string, any> = {};
        Object.entries(inputs).forEach(([name, config]) => {
            const { iconL, ...rest } = config;
            const processed = iconL ? { ...rest, icon: iconL } : rest;

            if (processed.type === 'money') {
                result[name] = { ...processed, type: 'custom', customInputClass: SMoneyInput };
            } else {
                result[name] = processed;
            }
        });
        return result;
    }

    render() {
        const { inputs, ...rest } = this.props;
        return (
            <SForm
                ref={r => { this._form = r; }}
                {...rest}
                inputs={inputs ? this.processInputs(inputs) : undefined}
            />
        );
    }
}
