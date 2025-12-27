import { Connection, Edge, EdgeProps } from "reactflow"
import { getEdgeId } from "../utils/utils"
import { GeneratedInformation } from "./Node"

export interface CustomEdgeData {
  label: string
  customType: 'dash' | 'plain' | 'arrow'
  editing: boolean
  generated: GeneratedInformation
}

interface CustomEdgeProps extends EdgeProps {
  data: CustomEdgeData
}

export const getNewEdge = (
  params: Connection,
  dataOptions?: CustomEdgeData,
) => {
  const data: CustomEdgeData = {
    ...({
      label: '',
      customType: 'plain',
      editing: false,
      generated: {
        pseudo: false,
        originRanges: [],
        originTexts: [],
      },
    } as CustomEdgeData),
    ...(dataOptions || {}),
  }
  return {
    ...params,
    id: getEdgeId(params.source || '', params.target || ''),
    data: data,
    selected: false,
  } as Edge
}