function Graph() {
    this.clusters = [];
}

function Cluster() {
    this.nodes = {};
    this.width = 0;
}

function Node(id, start, end, clique, cluster, position) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.clique = clique || {};
    this.cluster = cluster || null;
    this.position = position || null;
}