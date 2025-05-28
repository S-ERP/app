import React from "react";
import { SPage, SText, SView } from "servisofts-component";
import Personaje from "../Personaje";
import * as THREE from "three";

export default class PlayerInfo extends React.Component {

    state = {
        velocity: { x: 0, y: 0, z: 0 },
    }
    update(props: { delta: number, personaje?: Personaje }) {
        const { personaje, delta } = props;
        if (!personaje || !personaje.body) return;

        const velocity = personaje.body.getLinearVelocity();
        const currentVelocityMap = {
            x: velocity.x().toFixed(0),
            y: velocity.y().toFixed(0),
            z: velocity.z().toFixed(0),
        };

        // Obtener la velocidad previa desde el estado o inicializarla
        const previousVelocity = this.state.velocity || { x: 0, y: 0, z: 0 };

        // Comparar la velocidad actual con la anterior
        const deltaX = Math.abs(currentVelocityMap.x - previousVelocity.x);
        const deltaY = Math.abs(currentVelocityMap.y - previousVelocity.y);
        const deltaZ = Math.abs(currentVelocityMap.z - previousVelocity.z);

        const minChange = 1;
        // Solo actualizar si el cambio en cualquier componente de la velocidad es mayor a 5
        if (deltaX > minChange || deltaY > minChange || deltaZ > minChange) {
            this.setState({
                velocity: currentVelocityMap
            });
        }
    }
    render() {
        return <SView>
            <SText>{"Player info"}</SText>
            <SText>{JSON.stringify(this.state)}</SText>
        </SView>
    }
}