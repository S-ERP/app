import STInput from "../STInput";
import STNode from "../STNode";
import STOutput from "../STOutput";


const Types = ["Add", "Subtract", "Multiply", "Divide", "Power", "Absolute"] as const;
type STNMathTypes = typeof Types[number];
export default class STNMath extends STNode {
    _color = "#1D4F70";
    output;
    tipo;
    valueA;
    valueB;
    constructor(key?: string) {
        super("STNMath", key)
        this.tipo = new STInput<STNMathTypes>(this, {
            name: "tipo",
            inputType: "ITSelect",
            value: "Add",
            options: [...Types],
            // allowConnect: (e) => false
        });
        this.valueA = new STInput<number>(this, {
            name: "valueA",
            connectorType: "value",
            inputType: "ITNumber",
            // type: "number",
            label: "Val 1",
            value: 1,
            // label: "Valor 1",
            // allowConnect: (e) => true
        });
        this.valueB = new STInput<number>(this, {
            name: "valueB",
            connectorType: "value",
            inputType: "ITNumber",
            // type: "number",
            label: "Val 2",
            value: 0,
            // label: "Valor 2",
            // allowConnect: (e) => true
        });

        this.output = new STOutput<number>(this, {
            name: "output",
            connectorType: "value",
            label: "Value",
            eval:  () => {
                switch (this.tipo.eval()) {
                    case "Add": return this.valueA.eval() + this.valueB.eval();
                    case "Multiply": return this.valueA.eval() * this.valueB.eval();
                    case "Subtract": return this.valueA.eval() - this.valueB.eval();
                    case "Divide": return this.valueA.eval() / this.valueB.eval();
                    case "Power": return Math.pow(this.valueA.eval(), this.valueB.eval());
                    case "Absolute": return Math.abs(this.valueA.eval());
                    default: return this.valueA.eval() + this.valueB.eval();
                }

            }
        });

    }

}

