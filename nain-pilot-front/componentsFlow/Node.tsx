import { Node, NodeProps } from "reactflow"
import { OriginRange } from "../types/entities/nodes/node-individual.entity"
import { hardcodedNodeSize } from "../utils/constants"

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