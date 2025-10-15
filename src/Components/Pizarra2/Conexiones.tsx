import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { usePizarra } from './Pizarra';
import Conexion from './Conexion';

interface ConexionesProps { }

const Conexiones = (props: ConexionesProps) => {
    const [conexiones, setConexiones] = React.useState<any>({});
    const pizarra = usePizarra();

    const calcularConexiones = async () => {
        let cantidad_puertos = 0;
        let cantidad_puertos_cargados = 0;
        const inputs: any[] = [];
        const outputs: any[] = [];
        Object.values(pizarra.nodos.current).forEach((_nodo: any) => {
            Object.values(_nodo.puertos.current).forEach((_puerto: any) => {
                cantidad_puertos++;
                if (_puerto.type == "input") inputs.push({
                    puerto: _puerto,
                    nodo: _nodo
                });
                if (_puerto.type == "output") outputs.push({
                    puerto: _puerto,
                    nodo: _nodo
                });
                if (_puerto.layout.value.x == 0 && _puerto.layout.value.y == 0 && _puerto.layout.value.width == 0 && _puerto.layout.value.height == 0) {
                    return;
                }
                cantidad_puertos_cargados++;
            });
        });
        if (cantidad_puertos != cantidad_puertos_cargados) {
            console.log("Cargando los puertos", cantidad_puertos, cantidad_puertos_cargados)
            return;
        }
        if(cantidad_puertos<=0){
            // console.log("No hay puertos");
            return;
        }
        console.log("LLego al final y cargo todos los puertos", inputs, outputs)

        const _conexiones: any = {};
        outputs.map(out => {
            inputs.map(inpu => {
                const id = out.nodo.id + "_" + out.puerto.id + "_" + inpu.nodo.id + "_" + inpu.puerto.id;
                if ((inpu.puerto.props.value).includes(out.puerto.props.value)) {
                    _conexiones[id] = {
                        id: id,
                        input: inpu,
                        output: out
                    }
                    // console.log("Conextar estos 2", inpu, out)
                } else {
                    if (_conexiones[id]) {
                        delete _conexiones[id]
                        // console.log("desconectar estos 2", inpu, out)
                    }
                }
            })
        })
        pizarra.applyDataServer();
        setConexiones({ ..._conexiones });

    }

    React.useEffect(() => {
        pizarra.conexiones.current = {
            calcularConexiones
        };

        return () => {
            pizarra.conexiones.current = null
        };
    }, []);

    
    return <>{
        Object.values(conexiones).map((conexion: any, index) => {
            return <Conexion inp={conexion.input} out={conexion.output} id={conexion.id} key={conexion.id} />
        })
    }</>
}

export default Conexiones;

// const styles = StyleSheet.create({
//     container: {}
// });
