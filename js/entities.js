function Graph() {
    this.cluster = [];
}

function Cluster() {
    this.mapOfNodesInCluster = {};
}

function Node(id, start, end, clique, cluster, position) {
    this.id = id;
    this.start = start;
    this.end = end;
    this.clique = clique || null;
    this.cluster = cluster || null;
    this.position = position || null;
}