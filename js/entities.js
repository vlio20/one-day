function Graph() {
    this.clusters = [];
    this.nodes = {};
}

function Cluster() {
    this.nodes = {};
    this.width = 0;
    this.maxCliqueSize = 1;
}

function Node(id, start, end, neighbours, cluster, position, biggestCliqueSize) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.neighbours = neighbours || {};
    this.cluster = cluster || null;
    this.position = position || null;
    this.biggestCliqueSize = 1;
}