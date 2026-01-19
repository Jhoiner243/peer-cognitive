"use client"

import { roundTo } from '@/lib/utils'
import dagre from 'dagre'
import React, {
  BaseSyntheticEvent,
  DragEvent,
  MouseEvent,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import isEqual from 'react-fast-compare'
import ReactFlow, {
  Background,
  Edge,
  EdgeMarker,
  EdgeTypes,
  MarkerType,
  Node,
  NodeTypes,
  OnConnectEnd,
  OnConnectStart,
  OnConnectStartParams,
  Position,
  ReactFlowInstance,
  ReactFlowProvider,
  SelectionMode,
  Viewport,
  useEdgesState,
  useNodesState,
  useOnViewportChange,
  useReactFlow
} from 'reactflow'
import 'reactflow/dist/style.css'
import { CustomMarkerDefs } from '../componentsFlow/CustomDefs'
import {
  CustomConnectionLine,
  CustomEdge,
  CustomEdgeData,
  customConnectionLineStyle,
  customEdgeOptions,
} from '../componentsFlow/Edge'
import { CustomNode, CustomNodeData, customAddNodes, hardcodedNodeWidthEstimation } from '../componentsFlow/Node'
import { SimpleEdge } from '../componentsFlow/SimpleEdge'
import '../styles/react-flow-custom.css'
import {
  hardcodedNodeSize,
  styles,
  useTokenDataTransferHandle,
} from '../utils/constants'
import { PromptSourceComponentsType } from '../utils/magicExplain'
import { ModelForMagic, globalBestModelAvailable } from '../utils/openAI'
import { useTimeMachine } from '../utils/timeMachine'
import { FlowContext, OriginRange, ReactFlowObjectContext } from './Contexts'



// Use our socket hook for data
import { useSocket } from '@/hooks/use-socket'
import { CustomControls } from '../componentsFlow/CustomControl'
import { AnswerObject } from '../types/answer'
import { EntityType } from '../utils/socket'
import { InterchangeContext } from './Interchange'
// Use dagre for layout if we want auto-layout, but user code didn't seem to have it in the snippet
// Check if user want auto-layout. Prior implementation used it.
// User code handles "InterchangeContext.answerObjects" to drive nodes/edges.
// We must BRIDGE useSocket data to what this component expects OR modify it to use socket directly.
// The user code uses `defaultNodes` and `defaultEdges` initially and listens to changes?
// No, it uses `useNodesState(defaultNodes)`.
// It relies on `answerObjects` from Context to find the answer object and maybe sync?
// The snippet has logic to merge nodes, drag/drop, etc.
// But it doesn't seem to populate initial nodes from `answerObjects` in the snippet provided.
// It might assume `defaultNodes` are passed or loaded elsewhere.
// I will Inject the socket listener HERE to update nodes/edges.

const reactFlowWrapperStyle = {
  width: '100%',
  height: '100vh',
  minHeight: '600px'
} as React.CSSProperties

const defaultNodes: Node[] = []
const defaultEdges: Edge[] = []

const nodeTypes = {
  custom: CustomNode,
} as NodeTypes

const edgeTypes: EdgeTypes = {
  custom: CustomEdge as any,
  simple: SimpleEdge,
} as EdgeTypes

/**
 * Controlling the diagram.
 */
const Flow = () => {
    // --- MOCKED CONTEXTS FOR NOW IF NOT PROVIDED BY PARENT ---
    // If we are strictly using this component inside `KnowledgeGraph`, we can wrap it or just mock values here.
    // For simplicity, I'm using default values matching the "Mock" logic.
    // Ideally we'd wrap this component in Providers.
    
  const interchangeContext = useContext(InterchangeContext)
  const answerObjects = interchangeContext?.questionAndAnswer?.answerObjects ?? []
  const handleSetSyncedCoReferenceOriginRanges = interchangeContext?.handleSetSyncedCoReferenceOriginRanges ?? (() => {})
  const handleAnswerObjectNodeMerge = interchangeContext?.handleAnswerObjectNodeMerge ?? (() => {})
  const { answerObjectId, generatingFlow } = useContext(ReactFlowObjectContext)

  const thisReactFlowInstance = useReactFlow()
  const {
    setNodes,
    setEdges,
    setViewport,
    addNodes,
    toObject,
    getViewport,
  }: ReactFlowInstance = thisReactFlowInstance

  const answerObject = answerObjects.find((a: AnswerObject) => a.id === answerObjectId)

  // use default nodes and edges
  const [nodes, , onNodesChange] = useNodesState(defaultNodes)
  const [edges, , onEdgesChange] = useEdgesState(defaultEdges)
  
  // Node interaction state
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([])
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<string[]>([])
  const [selectedNodeForMerge, setSelectedNodeForMerge] = useState<string | null>(null)
  
  // --- INTEGRATION: SOCKET LISTENER ---
  const { socket } = useSocket()
  
  useEffect(() => {
    console.log('[KnowledgeGraph] useEffect running, socket:', socket)
    if (!socket) {
      console.warn('[KnowledgeGraph] No socket available')
      return
    }
    
    console.log('[KnowledgeGraph] Setting up graph-update listener')
    
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    const nodeWidth = 172
    const nodeHeight = 36

    const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
        const isHorizontal = direction === 'LR'
        dagreGraph.setGraph({ rankdir: direction })
    
        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: node.width || nodeWidth, height: node.height || nodeHeight })
        })
    
        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target)
        })
    
        dagre.layout(dagreGraph)
    
        nodes.forEach((node) => {
            const nodeWithPosition = dagreGraph.node(node.id)
            node.targetPosition = isHorizontal ? Position.Left : Position.Top
            node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom
    
            node.position = {
                x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
                y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
            }
    
            return node
        })
    
        return { nodes, edges }
    }

    const handleGraphUpdate = (data: { nodes: any[]; edges: any[] }) => {
       console.log('[KnowledgeGraph] ===== GRAPH UPDATE RECEIVED =====')
       console.log('[KnowledgeGraph] Advanced Flow Graph Update:', data)
       
       // Direct mapping without complex filtering
       const connectedNodeIds = new Set<string>()
       data.edges.forEach((e: any) => {
         e.edgePairs.forEach((pair: any) => {
           connectedNodeIds.add(pair.sourceId)
           connectedNodeIds.add(pair.targetId)
         })
       })

       const filteredNodes = data.nodes.filter((n: any) => {
         if (n.id === '$N1') return true
         return connectedNodeIds.has(n.id)
       })

       if (filteredNodes.length === 0 && data.nodes.length > 0) {
          // If everything is filtered but there was data, keep at least one (fallback)
          // Actually, user wants "strictly eliminate", so I will follow that.
       }

       const rfNodes: Node[] = filteredNodes.map((n: any) => {
         const label = n.nodeLabel || n.id
         const isHighlighted = highlightedNodeIds.includes(n.id)
         const isCollapsed = collapsedNodeIds.includes(n.id)
         const isSelectedForMerge = selectedNodeForMerge === n.id
         
         return {
            id: n.id,
            type: 'custom', 
            data: {
              label: label,
              tags: [],
              sourceHandleId: `handle-${n.id}-source`,
              targetHandleId: `handle-${n.id}-target`,
              editing: false,
              styleBackground: isSelectedForMerge 
                ? 'rgba(59, 130, 246, 0.1)' // Blue for merge source
                : styles.nodeColorDefaultWhite,
              generated: {
                pseudo: false,
                originRanges: n.originRange ? [n.originRange] : [],
                originTexts: [n.originText || '']
              }
            },
            position: { x: 0, y: 0 },
            width: hardcodedNodeWidthEstimation(label, false),
            height: hardcodedNodeSize.height,
            className: `${isHighlighted ? 'custom-node-body-highlighted' : ''} ${isCollapsed ? 'node-collapsed' : ''}`.trim(),
         }
       })
       
       let edgeCounter = 0;
       const rfEdges: Edge[] = data.edges.flatMap((e: any) => 
         e.edgePairs.map((pair: any) => {
            const uniqueId = `edge-${pair.sourceId}-${pair.targetId}-${e.edgeLabel}-${edgeCounter++}`;
            return {
            id: uniqueId,
            source: pair.sourceId,
            target: pair.targetId,
            type: 'custom',
            data: {
                label: e.edgeLabel,
                customType: 'arrow',
                editing: false,
                generated: {
                    pseudo: false,
                    originRanges: e.originRange ? [e.originRange] : [],
                    originTexts: [e.originText || '']
                },
                saliency: pair.saliency
            },
            markerEnd: {
                 type: MarkerType.ArrowClosed,
                 color: styles.edgeColorStrokeDefault,
            }
         }})
       )
       
       console.log('[KnowledgeGraph] Mapped nodes/edges:', { nodes: rfNodes.length, edges: rfEdges.length })

       const layouted = getLayoutedElements(rfNodes, rfEdges)

       console.log('[KnowledgeGraph] Layouted nodes/edges:', { nodes: layouted.nodes.length, edges: layouted.edges.length })

       setNodes(layouted.nodes)
       setEdges(layouted.edges)
       
       // Fit view after a short delay to ensure nodes are rendered
       setTimeout(() => {
         thisReactFlowInstance.fitView({ padding: 0.2, duration: 200 })
       }, 100)
    }
    
    socket.on('graph-update', handleGraphUpdate)
    console.log('[KnowledgeGraph] Listener registered for graph-update')
    
    return () => {
        console.log('[KnowledgeGraph] Cleaning up graph-update listener')
        socket.off('graph-update', handleGraphUpdate)
    }
  }, [socket, setNodes, setEdges])
  // ------------------------------------

  const defaultViewport = {
    x: typeof window !== 'undefined' ? (window.innerWidth * 0.5) / 2 : 0,
    y: typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.3, 1000) / 2 : 0,
    zoom: 1,
  }

  /* -------------------------------------------------------------------------- */
  // ! internal states
  const reactFlowWrapper = useRef(null)

  const [selectedComponents, setSelectedComponents] = useState({
    nodes: [],
    edges: [],
  } as PromptSourceComponentsType)

  const { undoTime, redoTime, canUndo, canRedo } = useTimeMachine(
    toObject(),
    setNodes,
    setEdges,
    setViewport,
  )

  // viewport
  const [roughZoomLevel, setRoughZoomLevel] = useState(
    roundTo(getViewport().zoom, 2),
  )
  useOnViewportChange({
    onChange: (v: Viewport) => {
      if (roughZoomLevel !== roundTo(getViewport().zoom, 2))
        setRoughZoomLevel(roundTo(getViewport().zoom, 2))
    },
  })

  const initialSelectItem = useRef<{
    selected: boolean
    type: 'node' | 'edge'
    id: string
  }>({
    selected: false,
    type: 'node',
    id: '',
  })

  /* -------------------------------------------------------------------------- */
  // ! keys
  const metaPressed = false

  // ! on connect
  const onConnect = useCallback(() => {}, [])

  /* -------------------------------------------------------------------------- */
  // ! Node Interactions
  /* -------------------------------------------------------------------------- */

  // Node click handler - Toggle highlight
  const onNodeClick = useCallback((event: MouseEvent, node: Node) => {
    console.log('[KnowledgeGraph] Node clicked:', node.id)
    
    setHighlightedNodeIds(prev => {
      if (prev.includes(node.id)) {
        // Remove from highlighted
        return prev.filter(id => id !== node.id)
      } else {
        // Add to highlighted
        return [...prev, node.id]
      }
    })
  }, [])

  // Node context menu - For merge and collapse
  const onNodeContextMenu = useCallback((event: MouseEvent, node: Node) => {
    event.preventDefault()
    console.log('[KnowledgeGraph] Node right-clicked:', node.id)
    
    // If a node is already selected for merge, merge them
    if (selectedNodeForMerge && selectedNodeForMerge !== node.id) {
      console.log('[KnowledgeGraph] Merging nodes:', selectedNodeForMerge, '->', node.id)
      handleAnswerObjectNodeMerge('default', selectedNodeForMerge, node.id)
      setSelectedNodeForMerge(null)
    } else {
      // Select this node for merge
      setSelectedNodeForMerge(node.id)
    }
  }, [selectedNodeForMerge, handleAnswerObjectNodeMerge])

  // Node double click - Toggle collapse
  const onNodeDoubleClick = useCallback((event: MouseEvent, node: Node) => {
    console.log('[KnowledgeGraph] Node double-clicked:', node.id)
    
    setCollapsedNodeIds(prev => {
      if (prev.includes(node.id)) {
        // Expand
        return prev.filter(id => id !== node.id)
      } else {
        // Collapse
        return [...prev, node.id]
      }
    })
  }, [])

  /* -------------------------------------------------------------------------- */
  // ! node

  // node - set editing status
  const doSetNodesEditing = useCallback(
    (nodeIds: string[], editing: boolean) => {
      setNodes((nds: Node[]) => {
        return nds.map((nd: Node) => {
          if (!nodeIds.includes(nd.id) || nd.type !== 'custom') return nd
          else {
            return {
              ...nd,
              data: {
                ...nd.data,
                editing,
              },
            }
          }
        })
      })
    },
    [setNodes],
  )

  const selectNodes = useCallback(
    (nodeIds: string[]) => {
      setNodes((nds: Node[]) => {
        return nds.map((nd: Node) => {
          if (!nodeIds.includes(nd.id))
            return {
              ...nd,
              selected: false,
            }
          else
            return {
              ...nd,
              selected: true,
            }
        })
      })
    },
    [setNodes],
  )

  // ! node right click
  const handleNodeContextMenu = useCallback((e: BaseSyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const selectNodeAndEdges = useCallback(
    (node: Node) => {
      setNodes((nds: Node[]) => {
        return nds.map((nd: Node) => {
          if (nd.id === node.id)
            return {
              ...nd,
              selected: true,
            }
          else if (nd.id !== node.id && nd.type === 'custom')
            return {
              ...nd,
              selected: false,
            }
          else return nd
        })
      })

      setEdges((eds: Edge[]) => {
        return eds.map((ed: Edge) => {
          if (ed.source === node.id || ed.target === node.id)
            return {
              ...ed,
              selected: true,
            }
          else return ed
        })
      })
    },
    [setEdges, setNodes],
  )

  const handleNodeClick = useCallback(
    (e: BaseSyntheticEvent, node: Node) => {
      // select the node and all its edges
      selectNodeAndEdges(node)
      initialSelectItem.current = {
        selected: true,
        type: 'node',
        id: node.id,
      }
    },
    [selectNodeAndEdges],
  )

  const handleNodeDoubleClick = useCallback(
    (e: BaseSyntheticEvent, node: Node) => {
      initialSelectItem.current = {
        selected: true,
        type: 'node',
        id: node.id,
      }
    },
    [],
  )

  const handleNodeDragStart = useCallback(
    (e: MouseEvent, node: Node) => {
      // anyNodeDragging.current = true
      selectNodeAndEdges(node)
      initialSelectItem.current = {
        selected: true,
        type: 'node',
        id: node.id,
      }
    },
    [selectNodeAndEdges],
  )

  const _centerIntersectingNodes = useCallback(
    (node: Node, movementX = 0, movementY = 0) => {
      const {
        position: { x: nodeXCurrent, y: nodeYCurrent },
        width: nodeWidthCurrent,
        height: nodeHeightCurrent,
      } = node

      const nodeXCurrentCenter =
        nodeXCurrent + (nodeWidthCurrent ?? 0) / 2 + movementX
      const nodeYCurrentCenter =
        nodeYCurrent + (nodeHeightCurrent ?? 0) / 2 + movementY

      const intersections = nodes
        .filter((nd: Node) => {
          if (nd.id === node.id) return false

          const {
            position: { x: nodeX, y: nodeY },
            width: nodeWidth,
            height: nodeHeight,
          } = nd

          return (
            nodeXCurrentCenter >= nodeX &&
            nodeXCurrentCenter <= nodeX + (nodeWidth ?? 0) &&
            nodeYCurrentCenter >= nodeY &&
            nodeYCurrentCenter <= nodeY + (nodeHeight ?? 0)
          )
        })
        .map(nd => nd.id)

      return intersections
    },
    [nodes],
  )

  const handleNodeDrag = useCallback(
    (e: MouseEvent, node: Node) => {
      if (
        generatingFlow ||
        !answerObject ||
        !answerObject.answerObjectSynced || // Guard
        answerObject.answerObjectSynced.listDisplay === 'summary'
      )
        return

      const intersections = _centerIntersectingNodes(
        node,
        e.movementX,
        e.movementY,
      )

      const setPosition = generatingFlow
        ? {}
        : {
            position: {
              x: node.position.x + e.movementX,
              y: node.position.y + e.movementY,
            },
          }

      setNodes(ns =>
        ns.map((n: Node): Node<CustomNodeData> => {
          if (n.id === node.id)
            return {
              ...n,
              ...setPosition,
              className:
                intersections.length && !generatingFlow
                  ? 'node-to-merge-source'
                  : '',
            }

          return {
            ...n,
            className: intersections.includes(n.id)
              ? 'node-to-merge-target'
              : '',
          }
        }),
      )
    },
    [_centerIntersectingNodes, answerObject, generatingFlow, setNodes],
  )

  const handleNodeDragStop = useCallback(
    (e: MouseEvent, node: Node) => {
      if (
        generatingFlow ||
        !answerObject ||
        !answerObject.answerObjectSynced ||
        answerObject.answerObjectSynced.listDisplay === 'summary'
      )
        return

      const intersections = _centerIntersectingNodes(node)

      // merge node with the first intersecting node
      if (intersections.length) {
        const targetNodeId = intersections[0]
        handleAnswerObjectNodeMerge(answerObjectId, node.id, targetNodeId)
      }
    },
    [
      _centerIntersectingNodes,
      answerObject,
      answerObjectId,
      generatingFlow,
      handleAnswerObjectNodeMerge,
    ],
  )

  /* -------------------------------------------------------------------------- */

  // ! drag and drop from tokens

  const handleDragOver = useCallback((e: DragEvent) => {  
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()

      const token = JSON.parse(
        e.dataTransfer.getData(`application/${useTokenDataTransferHandle}`),
      ) as EntityType

      // check if the dropped element is valid
      if (typeof token === 'undefined' || !token || !token.value) {
        return
      }

      const position = thisReactFlowInstance.project({
        x: e.clientX,
        y: e.clientY,
      })

      // add by drop tokens
      customAddNodes(
        addNodes,
        selectNodes,
        position.x - hardcodedNodeSize.width / 2,
        position.y - hardcodedNodeSize.height / 2,
        {
          label: `${token.value}`,
          select: false,
          editing: false,
          styleBackground: styles.nodeColorDefaultWhite,
          toFitView: false,
          fitView: undefined,
        },
      )
    },
    [addNodes, selectNodes, thisReactFlowInstance],
  )

  /* -------------------------------------------------------------------------- */
  // ! edge

  const onConnectStart = useCallback(
    (_: MouseEvent, { nodeId, handleId }: OnConnectStartParams) => {},
    [],
  )

  const onConnectEnd = useCallback((event: any) => {}, [])

  const doSetEdgesEditing = useCallback(
    (edgeIds: string[], editing: boolean) => {
      setEdges((eds: Edge[]) => {
        return eds.map((ed: Edge) => {
          if (!edgeIds.includes(ed.id)) return ed
          else {
            return {
              ...ed,
              data: {
                ...ed.data,
                editing,
              },
            }
          }
        })
      })
    },
    [setEdges],
  )

  const handleEdgeClick = useCallback((e: MouseEvent, edge: Edge) => {
    initialSelectItem.current = {
      selected: true,
      type: 'edge',
      id: edge.id,
    }
  }, [])

  const handleEdgeDoubleClick = useCallback(
    (e: BaseSyntheticEvent, edge: Edge) => {
      initialSelectItem.current = {
        selected: true,
        type: 'edge',
        id: edge.id,
      }
    },
    [],
  )

  /* -------------------------------------------------------------------------- */
  // ! pane

  const handlePaneClick = useCallback(
    (e: MouseEvent) => {
      // if any node is editing
      if (nodes.some(nd => nd.data?.editing))
        setNodes((nds: Node[]) => {
          return nds.map((nd: Node) => {
            if (!nd.data.editing || nd.type !== 'custom') return nd
            return {
              ...nd,
              data: {
                ...nd.data,
                editing: false,
              } as CustomNodeData,
            } as Node
          })
        })

      handleSetSyncedCoReferenceOriginRanges([] as OriginRange[])

      initialSelectItem.current = {
        selected: false,
        type: 'node',
        id: '',
      }
    },
    [handleSetSyncedCoReferenceOriginRanges, nodes, setNodes],
  )

  /* -------------------------------------------------------------------------- */
  // ! chat

  const handleNodeMouseEnter = useCallback(
    (e: MouseEvent, node: Node) => {
      const { data } = node
      const {
        generated: { originRanges },
      } = data as CustomNodeData
      if(originRanges) handleSetSyncedCoReferenceOriginRanges(originRanges)
    },
    [handleSetSyncedCoReferenceOriginRanges],
  )

  const handleNodeMouseLeave = useCallback(
    (e: MouseEvent, node: Node) => {
      const selectedRanges = nodes
          .filter((nd: Node) => nd.selected)
          .map(selectedNode => {
            const node = nodes.find((nd: Node) => nd.id === selectedNode.id)
            if (!node) return null

            const { data } = node
            const { generated } = data as CustomNodeData
            
            return generated ? generated.originRanges : null
          })
          .filter((ranges): ranges is OriginRange[] => ranges !== null)
          .flat(1)

      handleSetSyncedCoReferenceOriginRanges(selectedRanges)
    },
    [handleSetSyncedCoReferenceOriginRanges, nodes],
  )

  const handleEdgeMouseEnter = useCallback(
    (e: MouseEvent, edge: Edge<CustomEdgeData>) => {
      if (edge.data?.generated?.originRanges)
        handleSetSyncedCoReferenceOriginRanges(
          edge?.data.generated?.originRanges,
        )
    },
    [handleSetSyncedCoReferenceOriginRanges],
  )

  const handleEdgeMouseLeave = useCallback(
    (e: MouseEvent, edge: Edge<CustomEdgeData>) => {
      const selectedRanges = edges
          .filter((ed: Edge) => ed.selected)
          .map(selectedEdge => {
            const edge = edges.find(ed => ed.id === selectedEdge.id)
            if (!edge) return null

            return edge.data?.generated?.originRanges ?? null
          })
          .filter((ranges): ranges is OriginRange[] => !!ranges)
          .flat(1)

      handleSetSyncedCoReferenceOriginRanges(selectedRanges)
    },
    [edges, handleSetSyncedCoReferenceOriginRanges],
  )

  const [modelForMagic, setModelForMagic] = useState<ModelForMagic>(
    globalBestModelAvailable,
  )

  const handleScroll = useCallback((e: any) => {}, [])

  return (
    <FlowContext.Provider
      value={{
        metaPressed,
        model: modelForMagic,
        selectedComponents: selectedComponents,
        initialSelectItem: initialSelectItem.current,
        doSetNodesEditing,
        doSetEdgesEditing,
        selectNodes,
        setModel: setModelForMagic,
      }}
    >
      <div
        className={`react-flow-wrapper${
          generatingFlow ? ' generating-flow' : ''
        }`}
        ref={reactFlowWrapper}
      >
        <ReactFlow
          className={`${metaPressed ? 'flow-meta-pressed' : ''}`}
          // basic
          defaultViewport={defaultViewport}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart as OnConnectStart}
          onConnectEnd={onConnectEnd as OnConnectEnd}
          // flow view
          style={reactFlowWrapperStyle}
          fitView={true}
          attributionPosition="bottom-right"
          maxZoom={2}
          minZoom={0.1}
          // edge specs
          elevateEdgesOnSelect={false}
          defaultEdgeOptions={customEdgeOptions} // adding a new edge with this configs without notice
          connectionLineComponent={CustomConnectionLine as any}
          connectionLineStyle={customConnectionLineStyle}
          // viewport control
          panOnScroll={false}
          zoomOnScroll={false}
          preventScrolling={false}
          selectionOnDrag={false}
          panOnDrag={[0, 1, 2]}
          selectionMode={SelectionMode.Full}
          selectNodesOnDrag={false}
          // ! actions
          onScroll={handleScroll}
          onNodeClick={onNodeClick as any}
          onNodeContextMenu={onNodeContextMenu as any}
          onNodeDoubleClick={onNodeDoubleClick as any}
          onPaneClick={handlePaneClick}
          onNodeDragStart={handleNodeDragStart}
          onNodeDrag={handleNodeDrag}
          onNodeDragStop={handleNodeDragStop}
          onEdgeClick={handleEdgeClick}
          onEdgeDoubleClick={handleEdgeDoubleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          // onPaneContextMenu={handlePaneContextMenu}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          onEdgeMouseEnter={handleEdgeMouseEnter}
          onEdgeMouseLeave={handleEdgeMouseLeave}
        >
            <CustomControls
            nodes={nodes}
            edges={edges}
            selectedComponents={selectedComponents}
            undoTime={undoTime}
            redoTime={redoTime}
            canUndo={canUndo}
            canRedo={canRedo}
            flowWrapperRef={reactFlowWrapper}
          />
          
          
          <CustomMarkerDefs
            markerOptions={
              {
                color: styles.edgeColorStrokeSelected,
              } as EdgeMarker
            }
          />
          <CustomMarkerDefs
            markerOptions={
              {
                color: styles.edgeColorStrokeExplained,
              } as EdgeMarker
            }
          />
        
          <Background className="bg-background" color="hsl(var(--muted))" />

        </ReactFlow>
      </div>
    </FlowContext.Provider>
  )
}

const ReactFlowComponent = memo(({ id }: { id?: string }) => {
  return (
    <ReactFlowProvider>
      <Flow key={`flow-${id || 'default'}`} />
    </ReactFlowProvider>
  )
}, isEqual)

export default ReactFlowComponent

export const KnowledgeGraph = () => <ReactFlowComponent />
