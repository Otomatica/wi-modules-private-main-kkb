
import componentTemplate from './relationGraph.html';
import ForceGraph3D from './../../../web/3d-force-graph.min.js';
import './relationGraph.css';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$timeout']);
class relationGraphController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element , $timeout) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$timeout = $timeout;

    }

    $onInit() {
        this.$timeout(() => this.initGraph(), 2000);
    }

    initGraph() {

        const rootId = 0;

        // Random tree
        const N = 80;
        this.gData = {
            nodes: [...Array(N).keys()].map(i => ({ id: i, collapsed: i !== rootId, childLinks: [], label:'id:'+i })),
            links: [...Array(N).keys()]
            .filter(id => id)
            .map(id => ({
                source: Math.round(Math.random() * (id - 1)),
                target: id
            }))
        };

        // link parent/children
        const nodesById = Object.fromEntries(this.gData.nodes.map(node => [node.id, node]));
        this.gData.links.forEach(link => {
            nodesById[link.source].childLinks.push(link);
            const a = this.gData.nodes[link.source];
            const b = this.gData.nodes[link.target];
            !a.neighbors && (a.neighbors = []);
            !b.neighbors && (b.neighbors = []);
            a.neighbors.push(b);
            b.neighbors.push(a);

            !a.links && (a.links = []);
            !b.links && (b.links = []);
            a.links.push(link);
            b.links.push(link);
        });

        const highlightNodes = new Set();
        const highlightLinks = new Set();
        let hoverNode = null;

        this.getPrunedTree = () => {
        const visibleNodes = [];
        const visibleLinks = [];
        let traverseTree = (node = nodesById[rootId]) => {
            visibleNodes.push(node);
            if (node.collapsed) return;
                visibleLinks.push(...node.childLinks);
                node.childLinks
                    .map(link => ((typeof link.target) === 'object') ? link.target : nodesById[link.target]) // get child node
                    .forEach(traverseTree);
            }
            traverseTree();
            return { nodes: visibleNodes, links: visibleLinks };
        };

        this.graph = ForceGraph3D();

        let updateHighlight = () => {
            this.graph
                .nodeColor(this.graph.nodeColor())
                .linkWidth(this.graph.linkWidth())
                .linkDirectionalParticles(this.graph.linkDirectionalParticles());
        };

        this.graph(this.$element[0].children[0])
            .showNavInfo(false)
            .height(984)
            .width(1620)
            .backgroundColor('#0000')
            .dagMode('td')
            .dagLevelDistance(50)
            .graphData(this.getPrunedTree())
            .nodeLabel('label')
            .linkWidth(link => highlightLinks.has(link) ? 3 : 1)
            .linkDirectionalParticles(link => highlightLinks.has(link) ? 3 : 1)
            .linkDirectionalParticleWidth(link => highlightLinks.has(link) ? 3 : 1)
            .linkDirectionalParticleColor(() => 'green')
            .nodeColor(node => {
                if(node.id == 0) return 'blue';   
                if(highlightNodes.has(node))
                    return node === hoverNode ? 'yellow' : 'orange'
                return node.childLinks.length ? 'white' : 'green';
            })
            .onNodeHover(node => {
                // no state change
                if ((!node && !highlightNodes.size) || (node && hoverNode === node)) return;

                highlightNodes.clear();
                highlightLinks.clear();
                if (node) {
                    highlightNodes.add(node);
                    node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
                    node.links.forEach(link => highlightLinks.add(link));
                }

                hoverNode = node || null;

                updateHighlight();
            })
            .onLinkHover(link => {
                highlightNodes.clear();
                highlightLinks.clear();

                if (link) {
                    highlightLinks.add(link);
                    highlightNodes.add(link.source);
                    highlightNodes.add(link.target);
                }

                updateHighlight();
            })
            .onNodeClick(node => {
                if (node.childLinks.length) {
                    node.collapsed = !node.collapsed; // toggle collapse state
                    this.graph.graphData(this.getPrunedTree());
                    this.graph.dagMode('td')
                }
            });
    }

    change() {
        if(this.toggle) this.gData.nodes.forEach(x => x.collapsed = false);
        if(!this.toggle) this.gData.nodes.forEach(x => x.collapsed = x.id != 0);
        this.graph.graphData(this.getPrunedTree());
        this.graph.dagMode('td');
    }
}

export default {
    bindings: {
        tag: '<?',
        depth: '<?'
    },
    designerInfo: {
        hideFromMenu: true,
    },
    require: {},
    controller: relationGraphController,
    template: componentTemplate
};