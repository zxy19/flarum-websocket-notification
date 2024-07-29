type ModelPathNode = {
    id?: string;
    name: string;
}
export class ModelPath {
    nodes: ModelPathNode[];
    data: any;
    constructor(str?: string) {
        if (str) {
            if (str.endsWith("}")) {
                const t = str.split('||');
                this.data = JSON.parse(t[1]);
                str = t[0];
            }
            this.nodes = str.split('.').map(n => {
                const ret: ModelPathNode = { name: n };
                if (n.includes('[')) {
                    const [name, id] = n.split('[');
                    ret.id = id.substring(0, id.length - 1);
                    ret.name = name;
                }
                return ret;
            });
        } else {
            this.nodes = [];
        }
    }
    toString(): string {
        return this.nodes.map(n => n.id ? `${n.name}[${n.id}]` : n.name).join('.');
    }
    add(name: string, id?: string): this {
        this.nodes.push({ name, id });
        return this;
    }
    get(name?: string): ModelPathNode | null {
        if (!name) return this.nodes[this.nodes.length - 1] || null;
        return this.nodes.find(n => n.name === name) || null;
    }
    getId(name?: string): string | null {
        const node = this.get(name);
        return node && (node.id || null);
    }
    getData(): any {
        return this.data;
    }
}