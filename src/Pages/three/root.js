import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SPage } from 'servisofts-component';
import { MenuButtom, MenuPages } from 'servisofts-rn-roles_permisos';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return <SPage>
            <MenuPages path='/three'>
                <MenuButtom url='/scene/list' label='Lista de scenas' icon={<SIcon name='World' fill={"#fff"} />} />
                <MenuButtom url='/mesh' label='Lista de mesh' icon={<SIcon name='Box' />} />
                <MenuButtom url='/three/AmmoExample' label='AmmoExample' icon={<SIcon name='Box' />} />
                <MenuButtom url='/three/Ammo2' label='Ammo2' icon={<SIcon name='Box' />} />
                <MenuButtom url='/three/PrimeraPersona' label='Primera Persona' icon={<SIcon name='Ajustes' />} />
                <MenuButtom url='/three/cubo' label='Cubo' icon={<SIcon name='Box' />} />
                <MenuButtom url='/three/world' label='WORLD' icon={<SIcon name='Box' />} />
                <MenuButtom url='/three/mesh' label='MESH' icon={<SIcon name='Box' />} />
                <MenuButtom url='/three/fp' label='FP' icon={<SIcon name='Box' />} />
                <MenuButtom url='/three/preview' label='PREVIEW' icon={<SIcon name='Box' />} />
                <MenuButtom url='/three/city' label='CITY' icon={<SIcon name='Box' />} />
                <MenuButtom url='/mesh/personajes2' label='Personajes' icon={<SIcon name='Box' />} />
            </MenuPages>
        </SPage>
    }
}
