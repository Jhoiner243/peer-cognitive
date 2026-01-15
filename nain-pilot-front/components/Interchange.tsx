import { createContext, useCallback, useContext } from "react"
import { QuestionAndAnswer } from "../types/answer"
import {
  deepCopyQuestionAndAnswer
} from "../utils/chatUtils"
import { ChatContext, OriginRange } from "./Contexts"
import { KnowledgeGraph } from "./KnowledgeGraph"

// Type definitions
export type NodeConceptExpansionType = 'explain' | 'examples'
export type ListDisplayFormat = 'original' | 'summary' | 'slide'
export type AnswerObjectEntitiesTarget = 'originText' | 'summary' | 'slide'

export interface InterchangeProps {
  data: QuestionAndAnswer
}

export interface InterchangeContextProps {
  questionAndAnswer: QuestionAndAnswer
  handleSetSyncedCoReferenceOriginRanges: (
    highlightedCoReferenceOriginRanges: OriginRange[],
  ) => void
  handleAnswerObjectNodeMerge: (
    id: string,
    nodeEntityFromId: string,
    nodeEntityToId: string,
  ) => void
  handleSwitchSaliency: () => void
}

export const InterchangeContext = createContext<InterchangeContextProps>(
  {} as InterchangeContextProps,
)

export const Interchange = ({
  data,
  data: {
    id,
    question,
    answer,
    answerObjects,
    modelStatus: { modelParsingComplete, modelError },
    synced: { saliencyFilter },
  },
}: InterchangeProps) => {
  const { setQuestionsAndAnswers } = useContext(ChatContext)

  const handleSetSyncedCoReferenceOriginRanges = useCallback(
    (highlightedCoReferenceOriginRanges: OriginRange[]) => {
      setQuestionsAndAnswers(
        (questionsAndAnswers: QuestionAndAnswer[]): QuestionAndAnswer[] =>
          questionsAndAnswers.map(
            (questionAndAnswer: QuestionAndAnswer): QuestionAndAnswer => {
              if (questionAndAnswer.id === id) {
                return {
                  ...deepCopyQuestionAndAnswer(questionAndAnswer),
                  synced: {
                    ...questionAndAnswer.synced,
                    highlightedCoReferenceOriginRanges,
                  },
                }
              }
              return questionAndAnswer
            },
          ),
      )
    },
    [id, setQuestionsAndAnswers],
  )

  const handleAnswerObjectNodeMerge = useCallback(
    (
      answerObjectId: string,
      nodeEntityFromId: string,
      nodeEntityToId: string,
    ) => {
      console.log('[Interchange] Node merge requested:', {
        answerObjectId,
        from: nodeEntityFromId,
        to: nodeEntityToId
      })
      
      setQuestionsAndAnswers((prevQsAndAs: QuestionAndAnswer[]) =>
        prevQsAndAs.map((qa: QuestionAndAnswer) => {
          if (qa.id !== id) return qa

          // Find the answer object to modify
          const updatedAnswerObjects = qa.answerObjects.map(answerObj => {
            if (answerObj.id !== answerObjectId) return answerObj

            // Deep copy the answer object
            const newAnswerObj = {
              ...answerObj,
              originText: {
                ...answerObj.originText,
                nodeEntities: [...answerObj.originText.nodeEntities],
                edgeEntities: [...answerObj.originText.edgeEntities]
              }
            }

            // Find source and target nodes
            const nodeFrom = newAnswerObj.originText.nodeEntities.find(
              n => n.id === nodeEntityFromId
            )
            const nodeTo = newAnswerObj.originText.nodeEntities.find(
              n => n.id === nodeEntityToId
            )

            if (!nodeFrom || !nodeTo) {
              console.warn('[Interchange] Could not find nodes for merge')
              return answerObj
            }

            // Merge node individuals from source to target
            nodeTo.individuals = [
              ...nodeTo.individuals,
              ...nodeFrom.individuals.map(ind => ({
                ...ind,
                id: nodeEntityToId // Update the ID
              }))
            ]

            // Remove source node
            newAnswerObj.originText.nodeEntities = newAnswerObj.originText.nodeEntities.filter(
              n => n.id !== nodeEntityFromId
            )

            // Update edges: redirect all edges from nodeFrom to nodeTo
            newAnswerObj.originText.edgeEntities = newAnswerObj.originText.edgeEntities
              .map(edge => ({
                ...edge,
                edgePairs: edge.edgePairs.map(pair => ({
                  ...pair,
                  sourceId: pair.sourceId === nodeEntityFromId ? nodeEntityToId : pair.sourceId,
                  targetId: pair.targetId === nodeEntityFromId ? nodeEntityToId : pair.targetId
                }))
              }))
              // Remove self-loops (edges from node to itself)
              .filter(edge => 
                !edge.edgePairs.some(pair => 
                  pair.sourceId === nodeEntityToId && pair.targetId === nodeEntityToId
                )
              )

            console.log('[Interchange] Node merge completed', {
              mergedNodeId: nodeEntityToId,
              removedNodeId: nodeEntityFromId,
              newIndividualsCount: nodeTo.individuals.length
            })

            return newAnswerObj
          })

          return {
            ...qa,
            answerObjects: updatedAnswerObjects,
            synced: {
              ...qa.synced,
              highlightedCoReferenceOriginRanges: []
            }
          }
        })
      )
    },
    [id, setQuestionsAndAnswers]
  )

  const handleSwitchSaliency = useCallback(() => {
    setQuestionsAndAnswers((prevQsAndAs: QuestionAndAnswer[]) =>
      prevQsAndAs.map((qa: QuestionAndAnswer) => {
        if (qa.id === id) {
          return {
            ...qa,
            synced: {
              ...qa.synced,
              saliencyFilter: saliencyFilter === 'high' ? 'low' : 'high',
            },
          }
        }
        return qa
      })
    )
  }, [id, saliencyFilter, setQuestionsAndAnswers])

  return (
    <InterchangeContext.Provider
      value={{
        questionAndAnswer: data,
        handleSetSyncedCoReferenceOriginRanges,
        handleAnswerObjectNodeMerge,
        handleSwitchSaliency,
      }}
    >
      <div className="interchange-item w-full h-full">
        {answer.length > 0 && <KnowledgeGraph key={`answer-${data.id}`} />}
      </div>
    </InterchangeContext.Provider>
  )
}