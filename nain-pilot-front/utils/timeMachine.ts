export const useTimeMachine = (current: any, setNodes: any, setEdges: any, setViewport: any) => {
  return {
    undoTime: () => console.log('Undo not implemented'),
    redoTime: () => console.log('Redo not implemented'),
    canUndo: false,
    canRedo: false
  }
}
