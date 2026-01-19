import { Edge, Node } from "reactflow";
import { getNewEdge } from "../componentsFlow/Edge";
import { CustomNodeData, getNewCustomNode } from "../componentsFlow/Node";
import { nodeLabelling } from "../constants/labellings";
import { QuestionAndAnswerSynced } from "../types/answer";
import { EdgePair } from "../types/entities/edges/edge-information.entity";
import { EdgeEntity } from "../types/entities/edges/edge.entity";
import { OriginRange } from "../types/entities/nodes/node-individual.entity";
import { NodeEntity } from "../types/entities/nodes/node.entity";
import { styles } from "./constants";
import { constructGraph } from "./graphContruct";
import { getEntitySource, getNodeEntityFromNodeEntityId, havePair, pairTargetIdHasPair, saliencyAHigherThanB } from "./response-processing";
import { getHandleId } from "./utils";

interface NodeMention {
  mentionOriginRange: OriginRange
  mentionOriginText: string
}

const _addMentionedNode = (
  nodeIdsMentionedByEdges: {
    [nodeId: string]: NodeMention[]
  },
  nodeId: string,
  mentionEdge: EdgeEntity,
) => {
  if (!nodeIdsMentionedByEdges[nodeId]) {
    nodeIdsMentionedByEdges[nodeId] = []
  }

  const { originRange, originText } = mentionEdge

  nodeIdsMentionedByEdges[nodeId].push({
    mentionOriginRange: originRange,
    mentionOriginText: originText,
  })
}

export const answerObjectsToReactFlow = (
  graph: dagre.graphlib.Graph<{}>,
  rawNodeEntities: NodeEntity[],
  rawEdgeEntities: EdgeEntity[],
  synced: QuestionAndAnswerSynced,
  collapsedNodeIds: string[],
): {
  nodes: Node[],
  edges: Edge[]
} => {
  const { saliencyFilter } = synced

  //Construimos los nodos y aristas de la entidad de nodos y aristas
  const nodes: Node[] = []
  const edges: Edge[] = []

  const nodeEntities: NodeEntity[] = [...rawNodeEntities]
  const edgeEntities: EdgeEntity[] = []

  const nodeIdsMentionedByEdges: {
    [nodeId: string]: NodeMention[]
  } = {}

  rawEdgeEntities.forEach(rawEdgeEntity => {
    const { edgePairs, edgeLabel, originRange, originText } = rawEdgeEntity

    if(edgePairs.length === 1 ){
      edgePairs.forEach((edgePair, index) => {
        edgeEntities.push({
          edgeLabel,
          originRange,
          originText,
          edgePairs: [edgePair],
        })

        const { sourceId, targetId } = edgePair
        _addMentionedNode(nodeIdsMentionedByEdges, sourceId, rawEdgeEntity)
        _addMentionedNode(nodeIdsMentionedByEdges, targetId, rawEdgeEntity)
      })
    } else {
       const pseudoNodeId = `${nodeLabelling}-${originRange.start}-${originRange.end}`
       const addedPairs: EdgePair[] = []

       edgePairs.forEach(({saliency, sourceId, targetId}) => {

         if(!getNodeEntityFromNodeEntityId(nodeEntities, pseudoNodeId)){
           nodeEntities.push({
             id: pseudoNodeId,
             displayNodeLabel: edgeLabel,
             pseudo: true,
             individuals: [
               {
                 id: pseudoNodeId,
              originRange,
              originText,
              nodeLabel: edgeLabel,
            }
          ],
        })
      }
      
      const sourceToPseudoPair = {
        saliency,
        sourceId,
        targetId: pseudoNodeId,
      }

      if(!havePair(addedPairs, sourceToPseudoPair)){
         edgeEntities.push({
            edgeLabel: '',
            edgePairs: [sourceToPseudoPair],
            originRange,
            originText,
          })
      }

      const pseudoToTargetPair = {
        saliency,
        sourceId: pseudoNodeId,
        targetId,
      }

      if(!havePair(addedPairs, pseudoToTargetPair)){
         edgeEntities.push({
            edgeLabel: '',
            edgePairs: [pseudoToTargetPair],
            originRange,
            originText,
          })
      }

      _addMentionedNode(nodeIdsMentionedByEdges, sourceId, rawEdgeEntity)
      _addMentionedNode(nodeIdsMentionedByEdges, targetId, rawEdgeEntity)
    })
    }
  })


  Object.keys(nodeIdsMentionedByEdges).forEach(nodeId => {
    const nodeEntity = getNodeEntityFromNodeEntityId(nodeEntities, nodeId)

    if(!nodeEntity){
      const nodeMentions = nodeIdsMentionedByEdges[nodeId]

      nodeEntities.push({
        id: nodeId,
        displayNodeLabel: '...',
        pseudo: false,
        individuals: nodeMentions.map(({mentionOriginRange, mentionOriginText}) => ({
          id: nodeId,
          originRange: mentionOriginRange,
          originText: mentionOriginText,
          nodeLabel: '...',
        }))
      })
    }
  })

   /* -------------------------------------------------------------------------- */

  const collapsedHiddenNodeIds: Set<string> = new Set()
  const collapseEndPoints = new Set([...collapsedNodeIds])
  const collapseEndPointsAdded: Set<string> = new Set([...collapsedNodeIds])


   while (collapseEndPoints.size > 0) {
    const collapseEndPointsLoop = [...collapseEndPoints]
    collapseEndPointsLoop.forEach(collapseEndPoint => {
  
      edgeEntities.forEach(({ edgePairs }) => {
        edgePairs.forEach(({ sourceId, targetId }) => {
          if (sourceId === collapseEndPoint) {
            collapsedHiddenNodeIds.add(targetId)

            if (
              pairTargetIdHasPair(edgeEntities, targetId) &&
              !collapseEndPointsAdded.has(targetId)
            ) {
              collapseEndPoints.add(targetId)
              collapseEndPointsAdded.add(targetId)
            }
          }
        })
      })

      collapseEndPoints.delete(collapseEndPoint)
    })
  }

   const filteredEdgeEntities = edgeEntities.filter(edgeEntity => {
    // const {
    //   originRange: { answerObjectId },
    // } = edgeEntity
    const { sourceId, targetId, saliency } = edgeEntity.edgePairs[0]

    // hidden node filter
    if (
      collapsedHiddenNodeIds.has(sourceId) ||
      collapsedHiddenNodeIds.has(targetId)
    )
      return false

    // saliency filter
    if (saliencyAHigherThanB(saliencyFilter, saliency)) return false


    if (sourceId === targetId || targetId === '$N1') return false


    const edgesBetweenSourceTarget = edgeEntities.filter(
      _e =>
        _e.edgePairs[0].sourceId === sourceId &&
        _e.edgePairs[0].targetId === targetId,
    )

    const edgeIsTheFirstOneBetweenSourceTarget =
      edgeEntities.findIndex(
        _e =>
          _e.edgePairs[0].sourceId === sourceId &&
          _e.edgePairs[0].targetId === targetId,
      ) === edgeEntities.indexOf(edgeEntity)

    if (edgesBetweenSourceTarget.length > 1) {

      if (
        edgeEntity.edgeLabel === '' &&
        !edgeIsTheFirstOneBetweenSourceTarget
      ) {
        return false
      }

      // remove the edge if there are edges with higher saliency
      const edgesWithHigherSaliency = edgesBetweenSourceTarget.filter(_e =>
        saliencyAHigherThanB(_e.edgePairs[0].saliency, saliency),
      )
      if (edgesWithHigherSaliency.length > 0) {
        return false
      }

      // remove the edge if there are edges with the same saliency and this is not the first one
      const edgesWithSameSaliency = edgesBetweenSourceTarget.filter(
        _e => _e.edgePairs[0].saliency === saliency,
      )
      if (
        edgesWithSameSaliency.length > 1 &&
        edgesWithSameSaliency.findIndex(
          _e =>
            _e.edgePairs[0].sourceId === sourceId &&
            _e.edgePairs[0].targetId === targetId,
        ) !== edgesWithSameSaliency.indexOf(edgeEntity)
      ) {
        return false
      }
    }

    return true
  })

  const filteredNodeEntities = nodeEntities.filter(nodeEntity => {
    // strictly eliminate orphan nodes
    const { id } = nodeEntity

    if (id === '$N1') return true

    const isConnected = filteredEdgeEntities.some(
      edgeEntity =>
        edgeEntity.edgePairs[0].sourceId === id ||
        edgeEntity.edgePairs[0].targetId === id,
    )

    return isConnected
  })

    const computedNodes = constructGraph(
    graph,
    nodeEntities,
    edgeEntities,
    filteredNodeEntities,
    filteredEdgeEntities,
  )

    const newNodesTracker: {
    [nodeId: string]: {
      sourceHandleId: string
      targetHandleId: string
    }
  } = {}

   computedNodes.map(({ id, x, y }) => {
    const entity = getNodeEntityFromNodeEntityId(nodeEntities, id)
    if (!entity) return null

    const { originRanges, originTexts } = getEntitySource(entity)

    newNodesTracker[id] = {
      sourceHandleId: getHandleId(),
      targetHandleId: getHandleId(),
    }

    return nodes.push(
      getNewCustomNode(
        id,
        entity.displayNodeLabel,
        x,
        y,
        newNodesTracker[id].sourceHandleId,
        newNodesTracker[id].targetHandleId,
        false, // selected
        false, // editing
        entity.pseudo
          ? styles.nodeColorDefaultGrey
          : styles.nodeColorDefaultWhite, // expanded edge label will be grey
        {
          pseudo: entity.pseudo,
          originRanges,
          originTexts,
        },
      ),
    )
  })

   filteredEdgeEntities.forEach(
    ({ edgeLabel, edgePairs, originRange, originText }) => {
      edgePairs.forEach(({ sourceId, targetId }) => {
        const targetNode: Node<CustomNodeData> | undefined  = nodes.find(
          node => node.id === targetId,
        )
        if (!targetNode) return null

        edges.push(
          getNewEdge(
            {
              source: sourceId,
              target: targetId,
              sourceHandle: newNodesTracker[sourceId].sourceHandleId,
              targetHandle: newNodesTracker[targetId].targetHandleId,
            },
            {
              label: edgeLabel,
              customType: targetNode.data.generated.pseudo  ? 'plain' : 'arrow',
              editing: false,
              generated: {
                pseudo: false,
                originRanges: [originRange],
                originTexts: [originText],
              },
            },
          ),
        )
      })
    },
  )
  return {
    nodes,
    edges
  }
}