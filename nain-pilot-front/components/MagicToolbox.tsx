'use client'

import {
  BaseSyntheticEvent,
  memo,
  MouseEvent,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import isEqual from 'react-fast-compare'
import { Edge, Node, useReactFlow, useStore } from 'reactflow'

import { DownloadIcon } from 'lucide-react'

import { FlowContext } from '../components/Contexts'
import { terms } from '../utils/constants'
import { NodeLabelAndTags, predefinedResponses } from '../utils/utils'
import { Loader } from './ai-elements/loader'

interface MagicToolboxProps {
  className?: string
  children: ReactElement | ReactElement[]
  // zoom: number
  onUnmount?: () => void
}
export const MagicToolbox = ({
  className,
  children,
  // zoom,
  onUnmount,
}: MagicToolboxProps) => {
  // unmount
  useEffect(() => {
    return () => {
      onUnmount && onUnmount()
    }
  }, [onUnmount])

  const [expanded, setExpanded] = useState<boolean>(false)
  const zoom = useStore(useCallback(store => store.transform[2], []))

  return (
    <div
      className={`fade-in magic-toolbox${className ? ` ${className}` : ''}${
        expanded ? ' expanded-toolbox' : ''
      }`}
      style={{
        transform: `scale(${1 / zoom})`,
      }}
      onClick={e => {
        e.stopPropagation()
      }}
      onMouseEnter={() => {
        setExpanded(true)
      }}
    >
      <div className="magic-toolbox-content">{children}</div>
      <DownloadIcon className="magic-toolbox-icon" />
    </div>
  )
}

interface MagicToolboxItemProps {
  title?: string
  children: ReactElement
  className?: string
}
export const MagicToolboxItem = ({
  title,
  children,
  className,
}: MagicToolboxItemProps) => {
  return (
    <div className={`magic-toolbox-item${className ? ' ' + className : ''}`}>
      {title && <span className="magic-toolbox-item-title">{title}</span>}
      {/* <div className="magic-toolbox-item-content">{children}</div> */}
      {children}
    </div>
  )
}

interface MagicToolboxButtonProps {
  content: ReactElement | string
  onClick?: (e: MouseEvent) => void
  preventDefault?: boolean
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
}
export const MagicToolboxButton = memo(
  ({
    content,
    onClick,
    preventDefault = true,
    className = '',
    style,
    disabled = false,
  }: MagicToolboxButtonProps) => {
    // handle click
    const handleOnClick = useCallback(
      (e: MouseEvent) => {
        if (preventDefault) {
          e.preventDefault()
          e.stopPropagation()
        }
        onClick && onClick(e)
      },
      [onClick, preventDefault],
    )

    return (
      <button
        className={
          'magic-toolbox-button' +
          (content === predefinedResponses.noValidResponse()
            ? ' disabled'
            : '') +
          (className ? ` ${className}` : '')
        }
        onClick={handleOnClick}
        disabled={disabled}
        style={style ?? {}}
      >
        {content}
      </button>
    )
  },
)

interface MagicTagProps {
  tag: string
  onClick?: (tag: string) => void
  disabled?: boolean
}
export const MagicTag = memo(
  ({ tag, onClick, disabled = false }: MagicTagProps) => {
    const handleOnClick = useCallback(
      (e: BaseSyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()

        onClick && onClick(tag)
      },
      [onClick, tag],
    )

    return (
      <button
        className={'magic-toolbox-tag'}
        onClick={handleOnClick}
        disabled={disabled}
      >
        {tag}
      </button>
    )
  },
)

interface MagicNodeTaggingItemProps {
  targetId: string
  label: string
}
export const MagicNodeTaggingItem = memo(
  ({ targetId, label }: MagicNodeTaggingItemProps) => {
    const { setNodes } = useReactFlow()

    const [availableTags, setAvailableTags] = useState<string[]>([])
    const [noAvailable, setNoAvailable] = useState<boolean>(true) // Mocked for now

    const customTagTextInputRef = useRef<HTMLInputElement>(null)

    const handleOnClick = useCallback(
      (tag: string) => {
        setNodes((nodes: Node[]) => {
          return nodes.map(node => {
            if (node.id === targetId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  tags: [...(node.data.tags || []), tag],
                },
              }
            }
            return node
          })
        })
      },
      [setNodes, targetId],
    )

    const handleAddCustomTag = useCallback(() => {
      const customTag = customTagTextInputRef.current?.value
      if (customTag) {
        setNodes((nodes: Node[]) => {
          return nodes.map(node => {
            if (node.id === targetId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  tags: [...(node.data.tags || []), customTag],
                },
              }
            }
            return node
          })
        })
        if (customTagTextInputRef.current) customTagTextInputRef.current.value = ''
      }
    }, [setNodes, targetId])

    useEffect(() => {
      setNoAvailable(true)
      setAvailableTags([])
    }, [label])

    return (
      <>
        <MagicToolboxItem
          className="magic-tagging-item"
          title={`${terms.wiki} tags`}
        >
          <div className="magic-tagging-options">
            {availableTags.length === 0 ? (
              !noAvailable ? (
                <div className="waiting-for-model-placeholder">
                  <Loader size={32} color="#13a600" />
                </div>
              ) : (
                <MagicTag
                  key={predefinedResponses.noValidTags()}
                  tag={predefinedResponses.noValidTags()}
                  disabled={true}
                />
              )
            ) : (
              availableTags.map((tag, ind) => (
                <MagicTag
                  key={`${targetId}-tag-${ind}-${tag}`}
                  tag={tag}
                  onClick={handleOnClick}
                />
              ))
            )}
          </div>
        </MagicToolboxItem>

        <MagicToolboxItem title="custom tags">
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              className="magic-toolbox-input"
              ref={customTagTextInputRef}
              type={'text'}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                color: 'white',
                padding: '2px 4px',
                width: '100px'
              }}
            />
            <MagicToolboxButton
              content={'add'}
              onClick={handleAddCustomTag}
            ></MagicToolboxButton>
          </div>
        </MagicToolboxItem>
      </>
    )
  },
)

interface MagicSuggestItemProps {
  target: 'node' | 'edge'
  targetId: string
  nodeLabelAndTags: NodeLabelAndTags[]
  edgeLabels: string[]
  disabled?: boolean
}
export const MagicSuggestItem = memo(
  ({
    target,
    targetId,
    nodeLabelAndTags,
    edgeLabels,
    disabled = false,
  }: MagicSuggestItemProps) => {
    const { setNodes, setEdges } = useReactFlow()
    const { model } = useContext(FlowContext)

    const [modelResponse] = useState<string>('')

    const handleSetSuggestion = useCallback(
      (suggestion: string) => {
        if (target === 'node') {
          setNodes((nodes: Node[]) => {
            return nodes.map(node => {
              if (node.id === targetId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    label: suggestion,
                  },
                }
              }
              return node
            })
          })
        } else if (target === 'edge') {
          setEdges((edges: Edge[]) => {
            return edges.map(edge => {
              if (edge.id === targetId) {
                return {
                  ...edge,
                  data: {
                    ...edge.data,
                    label: suggestion,
                  },
                }
              }
              return edge
            })
          })
        }
      },
      [setEdges, setNodes, target, targetId],
    )

    const responseButtons: ReactElement[] = modelResponse
      .split(', ')
      .slice(0, 5)
      .filter(l => l.trim().length > 0)
      .map((label, i) => {
        label = label.trim()
        label = label.replace(/^\d+\./, '')
        label = label.replace(/['"]+/g, '')
        label = label.trim()
        if (target === 'edge') label = label.toLowerCase()

        if (label[label.length - 1] === '.') {
          label = label.slice(0, -1)
        }

        return (
          <MagicToolboxButton
            key={i}
            content={label}
            onClick={() => {
              handleSetSuggestion(label)
            }}
          />
        )
      })

    return (
      <MagicToolboxItem
        className="magic-suggest-item"
        title={`${terms[model] || model} suggestions`}
      >
        <div className="magic-suggest-options">
          {modelResponse.length > 0 ? (
            <>{responseButtons}</>
          ) : (
            <div className="waiting-for-model-placeholder">
              <Loader size={32} color="#57068c" />
            </div>
          )}
        </div>
      </MagicToolboxItem>
    )
  },
  isEqual,
)
