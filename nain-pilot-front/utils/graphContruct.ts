import dagre from 'dagre'
import { hardcodedNodeWidthEstimation } from "../componentsFlow/Node"
import { EdgeEntity } from "../types/entities/edges/edge.entity"
import { NodeEntity } from "../types/entities/nodes/node.entity"
import { hardcodedNodeSize } from "./constants"

export const constructGraph = (
  graph: dagre.graphlib.Graph<{}>,
  rawNodeEntities: NodeEntity[],
  rawEdgeEntities: EdgeEntity[],
  nodeEntities: NodeEntity[],
  edgeEntities: EdgeEntity[],
) => {
  // https://github.com/dagrejs/dagre/wiki#an-example-layout
  graph.setGraph({
    rankdir: 'LR',
    // align: 'UL',
    ranksep: 90, // !
    nodesep: 15, // !
    // ranker: 'longest-path',
  })
  graph.setDefaultEdgeLabel(function () {
    return ''
  })

  // for (const nId of graph.nodes()) {
  //   graph.removeNode(nId)
  // }

  rawNodeEntities.forEach(nodeE => {
    // check if the node is nodeEntities
    const nodeEntity = nodeEntities.find(nE => nE.id === nodeE.id)

    if (!nodeEntity) {
      graph.removeNode(nodeE.id)
    } else {
      graph.setNode(nodeE.id, {
        label: nodeE.id,
        width: hardcodedNodeWidthEstimation(
          nodeE.displayNodeLabel,
          nodeE.pseudo,
        ),
        height: hardcodedNodeSize.height,
      })
    }
  })

  rawEdgeEntities.forEach(edgeE => {
    const edgeLabel = edgeE.edgeLabel
    const edgePair = edgeE.edgePairs[0]

    // check if the edge is edgeEntities
    const edgeEntity = edgeEntities.find(eE => {
      return (
        edgePair.sourceId === eE.edgePairs[0].sourceId &&
        edgePair.targetId === eE.edgePairs[0].targetId &&
        edgeLabel === eE.edgeLabel
      )
    })

    if (!edgeEntity) {
      graph.removeEdge(edgePair.sourceId, edgePair.targetId)
    } else {
      graph.setEdge(edgePair.sourceId, edgePair.targetId, {
        label: edgeE.edgeLabel,
      })
    }
  })

  // ! compute
  dagre.layout(graph)
  // console.log('* graph layout')

  // print the graph
  const nodes: {
    id: string
    x: number
    y: number
  }[] = []
  graph.nodes().forEach(v => {
    nodes.push({
      id: graph.node(v).label as string,
      x: graph.node(v).x,
      y: graph.node(v).y,
    })
  })

  return nodes
}