import SSocket from 'servisofts-socket'

export default class Hanldes {

    static verificarProducto() {
        this.setState({ loading: true, error: "Verificando el producto..." })
        SSocket.sendPromise({
            service: "inventario",
            component: "producto",
            type: "verificar",
            data: {
                marca: this.props.data["MARCA:"],
                modelo: this.props.data["MODELO:"],
                chasis: this.props.data["CHASIS:"],
                motor: this.props.data["MOTOR:"]
            }
        }).then(e => {
            this.setState({ loading: false, error: "", compra_venta: e.data })
            let func = Hanldes.verificarPlanDePagos.bind(this);
            func(this.props.data.cuotas, e.data.cuotas);

        }).catch(e => {
            console.error(e);
            this.setState({ loading: false, error: e.error })
        })
    }

    static verificarPlanDePagos(plan_pago_excel, plan_pago_db) {
        this.setState({ loading: true, error: "Verficando el plan de pagos..." })

        let arr_plan_pago_db = Object.values(plan_pago_db);
        // Verificar cantidad de cuotas
        if ((arr_plan_pago_db.length - 1) != plan_pago_excel.length) {
            this.setState({ loading: false, error: "Cantidad de cuotas diferentes." })
            return;
        }
        console.log(plan_pago_excel)
        console.log(plan_pago_db)
    }
}