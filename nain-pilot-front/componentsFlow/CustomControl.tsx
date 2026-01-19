import { RotateCcw } from 'lucide-react'
import { memo } from 'react'
import { ControlButton, Controls } from 'reactflow'

export const CustomControls = memo(({ fitView, onFitView, interactive = true }: any) => {
  return (
    <Controls showInteractive={interactive} className='top h-7'>
      <ControlButton onClick={() => console.log('Undo logic placeholder')}>
        <RotateCcw className="w-4 h-4" />
      </ControlButton>
    </Controls>
  )
})
