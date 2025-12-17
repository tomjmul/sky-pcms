var Adapter = function () {

    this.evaluate = function () {
        return this.adapter;
    };

    this.title = function () {
        var atomEmoji = '\uD83C\uDF10';

        if (!this.adapter) {
            return "Adapter " + atomEmoji;
        }

        return atomEmoji;
    };

    this.text = function () {
        return this.adapter || null;
    };
};

Adapter.inputs = [
    InputField("adapter", "Adapter", "Radio", {
        "choices": {
            "v1/adapter-atlas": 'Atlas v1',
            "v2/adapter-atlas": 'Atlas v2',
            "v3/adapter-atlas": 'Atlas v3',
            "adapter-calypso": 'Calypso',
        }
    })
];

Adapter.identifier = "com.sky.atom.Adapter";
Adapter.title = "Atom Client Adapter";
registerDynamicValueClass(Adapter);
