import { FitView, Handle, Instance, Node, NodeProps, Position } from "reactflow"
import { MagicNodeTaggingItem, MagicSuggestItem, MagicToolbox } from "../components/MagicToolbox"
import { OriginRange } from "../types/entities/nodes/node-individual.entity"
import { hardcodedNodeSize, viewFittingOptions } from "../utils/constants"
import randomPhrases from "../utils/randomPhrases"
import { getHandleId, getNodeId } from "../utils/utils"

export interface GeneratedInformation {
  pseudo: boolean
  originRanges: OriginRange[]
  originTexts: string[]
}

export interface NodeSnippet {
  id: string
  label: string
  position: {
    x: number
    y: number
  }
  width: number
  height: number
}

export interface CustomNodeData {
  label: string
  tags: string[]
  sourceHandleId: string
  targetHandleId: string
  // states
  editing: boolean
  // styles
  styleBackground: string
  // generated
  generated: GeneratedInformation
  [key: string]: unknown
}

interface CustomNodeProps extends NodeProps {
  data: CustomNodeData
}



export const hardcodedNodeWidthEstimation = (
  content: string,
  pseudo: boolean,
) => {
  // make a pseudo node to estimate width
  const pseudoNode = document.createElement('span')

  pseudoNode.className = pseudo
    ? 'width-measuring-span-pseudo'
    : 'width-measuring-span'
  pseudoNode.innerText = content

  document.body.appendChild(pseudoNode)
  const width = pseudoNode.getBoundingClientRect().width
  document.body.removeChild(pseudoNode)

  return pseudo ? Math.max(80, width) : Math.max(160, width)

}

export const getNewCustomNode = (
  nodeId: string,
  label: string,
  x: number,
  y: number,
  sourceHandleId: string,
  targetHandleId: string,
  selected: boolean,
  editing: boolean,
  styleBackground: string,
  generated: GeneratedInformation,
) => {
  const { height: nodeHeight } = hardcodedNodeSize

  return {
    id: nodeId,
    type: 'custom', 
    data: {
      label: label,
      tags: [],
      sourceHandleId: sourceHandleId,
      targetHandleId: targetHandleId,
      editing: editing,
      styleBackground: styleBackground,
      generated: generated,
    } as CustomNodeData,
    position: { x, y },
    selected: selected,
    width: hardcodedNodeWidthEstimation(label, generated.pseudo),
    height: nodeHeight,
  } as Node
}

export const CustomNode = ({ data, selected }: CustomNodeProps) => {
  const isPseudo = data.generated?.pseudo

  return (
    <div
      className={`relative px-4 py-2 shadow-md rounded-md dark:bg-black border-2 transition-all duration-200 ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-stone-200 hover:border-stone-400'
      } ${isPseudo ? 'opacity-50 border-dashed' : ''} min-w-[150px]`}
      style={{ background: data.styleBackground }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-stone-400 rounded-full"
        id={data.targetHandleId}
      />
      
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="font-bold text-sm text-center text-foreground break-words w-full">
           {data.label}
        </div>
        
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mt-1">
            {data.tags.map((tag, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-stone-400 rounded-full"
        id={data.sourceHandleId}
      />

      {selected && (
        <MagicToolbox key={`toolbox-${data.id}`}>
          <MagicSuggestItem
            target="node"
            targetId={data.id as any}
            nodeLabelAndTags={[]}
            edgeLabels={[]}
          />
          <MagicNodeTaggingItem targetId={data.id as any} label={data.label} />
        </MagicToolbox>
      )}
    </div>
  )
}

type CustomAddNodesOptions = {
  label?: string
  select: boolean
  editing: boolean
  styleBackground: string
  fitView: FitView | undefined
  toFitView: boolean
}
export const customAddNodes = (
  addNodes: Instance.AddNodes<Node>,
  selectNodes: (nodeIds: string[]) => void,
  x: number,
  y: number,
  {
    label,
    select,
    editing,
    styleBackground,
    fitView,
    toFitView,
  }: CustomAddNodesOptions,
): {
  nodeId: string
  sourceHandleId: string
  targetHandleId: string
} => {
  const nodeId = getNodeId()
  const sourceHandleId = getHandleId()
  const targetHandleId = getHandleId()

  label = label ?? randomPhrases()

  const newNode = getNewCustomNode(
    nodeId,
    label,
    x,
    y,
    sourceHandleId,
    targetHandleId,
    select,
    editing,
    styleBackground,
    {
      pseudo: false,
      originRanges: [],
      originTexts: [],
    },
  )

  addNodes(newNode)

  setTimeout(() => {
    if (toFitView && fitView) fitView(viewFittingOptions)
    if (select) {
      selectNodes([nodeId])
    }
  }, 0)

  return {
    nodeId,
    sourceHandleId,
    targetHandleId,
  }
}