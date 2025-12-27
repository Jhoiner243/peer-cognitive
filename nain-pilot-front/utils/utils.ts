import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'

export const getSimpleNodeId = (baseId: string) => `node-${baseId}`
export const getNodeId = (nodeLabel?: string, extraId?: string) =>
  (nodeLabel ? `node-${uuidv5(nodeLabel, uuidv5.URL)}` : `node-${uuidv4()}`) +
  (extraId ? `-${extraId}` : '')
export const getMagicNodeId = () => `magic-node-${uuidv4()}`
export const getGroupNodeId = () => `group-node-${uuidv4()}`

export const getHandleId = () => `handle-${uuidv4()}`
export const getEdgeId = (sourceId: string, targetId: string) =>
  `edge-${sourceId}---${targetId}---${uuidv4()}`
export const getNoteId = () => `note-${uuidv4()}`
