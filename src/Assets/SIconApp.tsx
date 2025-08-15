import React from 'react';
import { SIcon } from "servisofts-component";
import { SIconType } from 'servisofts-component/Component/SIcon';
import { IconNames } from 'servisofts-component/img';
import { IconNamesApp } from '.';

type AllIconNames = IconNames | IconNamesApp;


export type SIconAppType = Omit<SIconType, "name"> & {
    name: AllIconNames;
}


const SIconApp = (props: SIconAppType) => {
    return <SIcon  {...props}  name={props.name as any}/>;
};

export default SIconApp
