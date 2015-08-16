function Graph() {
    this.clusters = [];
    this.nodes = {};
}

function Cluster() {
    this.nodes = {};
    this.width = 0;
    this.maxCliqueSize = 1;
}

function Node(id, start, end) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.neighbours = {};
    this.cluster = null;
    this.position = null;
    this.biggestCliqueSize = 1;
}