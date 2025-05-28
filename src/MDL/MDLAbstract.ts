export default class MDLAbstract<MDLTypes extends { type: string }> {
    private LISTENERS: Partial<Record<MDLTypes["type"], ((data: MDLTypes) => void)[]>> = {};

    async componentDidMount() {

    }
    addEventListener = <T extends MDLTypes["type"]>(
        type: T,
        callback: (data: Extract<MDLTypes, { type: T }>) => void
    ) => {
        const listeners = this.LISTENERS as Record<string, ((data: MDLTypes) => void)[]>;
        if (!listeners[type]) {
            listeners[type] = [];
        }
        listeners[type].push(callback as (data: MDLTypes) => void);
        return callback;
    };

    removeEventListener = <T extends MDLTypes["type"]>(
        callback: (data: Extract<MDLTypes, { type: T }>) => void
    ): void => {
        const listeners = this.LISTENERS as Record<string, ((data: MDLTypes) => void)[]>;
        for (const type in listeners) {
            listeners[type] = listeners[type].filter(cb => cb !== callback);
        }
        console.log("removeEventListener", listeners);
    };

    dispatchEvent = <T extends MDLTypes>(event: T): void => {
        const { type } = event;
        const listeners = this.LISTENERS as Record<string, ((data: MDLTypes) => void)[]>;
        listeners[type]?.forEach(async (cb) => cb(event));
    };

    clearEventListeners = (type?: MDLTypes["type"]): void => {
        const listeners = this.LISTENERS as Record<string, ((data: MDLTypes) => void)[]>;
        if (type) {
            delete listeners[type];
        } else {
            this.LISTENERS = {};
        }
    };
}
