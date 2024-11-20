class TerritoryNode {
    constructor(name, id, value) {
        this.name = name;
        this.id = id;
        this.value = value;
        this.children = [];
    }

    addChild(node, parentId) {
        if (this.id === parentId) {
            this.children.push(node);
        } else {
            for (const child of this.children) {
                child.addChild(node, parentId);
            }
        }
    }

    clean() {
        if (this.children.length > 0) {
            delete this.value;
            for (const child of this.children) {
                child.clean();
            }
        }
        if (this.children.length === 0) {
            delete this.children;
        }
    }
}

class TerritoryTree {
    constructor(name, id) {
        this.root = new TerritoryNode(name, id);
    }

    addNode(name, id, value, parentId) {
        const newNode = new TerritoryNode(name, id, value);
        this.root.addChild(newNode, parentId);
    }

    clean() {
        this.root.clean();
    }
}

export { TerritoryNode, TerritoryTree };