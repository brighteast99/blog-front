import { FC, ReactNode, useCallback, useState } from 'react'
import {
  TypedDocumentNode,
  gql,
  useLazyQuery,
  useMutation,
  useQuery
} from '@apollo/client'
import clsx from 'clsx'
import { Placement } from '@floating-ui/react'
import { getRelativeTimeFromNow } from 'utils/dayJS'
import { Draft } from 'types/data'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { PopoverMenu } from 'components/PopoverMenu'
import { Spinner } from 'components/Spinner'
import { Tiptap } from 'components/Tiptap'

export const GET_DRAFTS: TypedDocumentNode<{ drafts: Draft[] }> = gql`
  query GetDrafts {
    drafts {
      id
      summary
      createdAt
    }
  }
`

export const GET_DRAFT: TypedDocumentNode<{ draft: Draft }, { id: number }> =
  gql`
    query GetDraft($id: Int!) {
      draft(id: $id) {
        id
        summary
        title
        category {
          id
          name
        }
        isHidden
        content
        thumbnail
        images
      }
    }
  `

export const DELETE_DRAFT: TypedDocumentNode<
  { deleteDraft: { success: boolean } },
  { id: number }
> = gql`
  mutation DeleteDraft($id: Int!) {
    deleteDraft(id: $id) {
      success
    }
  }
`

export interface DraftManagerProps {
  className?: string
  placement?: Placement
  tooltipPlacement?: Placement
  description?: string
  children?: ReactNode
  onSelect?: (data: Draft) => any
}

export const DraftManager: FC<DraftManagerProps> = ({
  className,
  placement = 'bottom-start',
  tooltipPlacement = 'bottom',
  description,
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { data: drafts, loading: loadingList } = useQuery(GET_DRAFTS)
  const [selectedDraft, setSelectedDraft] = useState<number>()
  const [loadTemplateInfo, { loading: loadingDraft, data: draft }] =
    useLazyQuery(GET_DRAFT, {
      fetchPolicy: 'cache-and-network'
    })
  const [_deleteDraft, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_DRAFT)

  const deleteDraft = useCallback(() => {
    if (!draft) return
    if (
      !window.confirm(`임시 저장본 '${draft.draft.summary}'을(를) 삭제합니다.`)
    )
      return

    _deleteDraft({
      variables: { id: Number(draft.draft.id) },
      refetchQueries: [
        {
          query: GET_DRAFTS
        }
      ],
      onCompleted: () => setSelectedDraft(undefined),
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('임시 저장본 삭제 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetDeleteMutation()
      }
    })
  }, [_deleteDraft, draft, resetDeleteMutation])

  return (
    <PopoverMenu
      className={className}
      open={isOpen}
      placement={placement}
      offset={12}
      tooltipPlacement={tooltipPlacement}
      description={description}
      menuBtn={
        <ThemedButton
          className='h-8 px-2'
          variant='hover-text'
          disabled={loadingList || !drafts?.drafts.length}
          color='primary'
        >
          {loadingList ? (
            <Spinner size='xs' />
          ) : (
            `임시 저장본 ${drafts?.drafts.length ? `(${drafts.drafts.length})` : '없음'}`
          )}
        </ThemedButton>
      }
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    >
      <div className='w-120 max-w-[90dvw] bg-neutral-50'>
        <div className='flex h-40 flex-col border-b border-neutral-100'>
          <div className='border-b border-neutral-100 bg-neutral-100 py-1 text-center'>
            임시 저장본 목록
          </div>
          <ul className='min-h-0 grow overflow-y-auto'>
            {drafts?.drafts.map((draft) => (
              <li
                className={clsx(
                  'px-1 py-0.5',
                  selectedDraft === draft.id
                    ? 'bg-primary bg-opacity-25 hover:brightness-125'
                    : 'hover:bg-background'
                )}
                key={draft.id}
                onClick={() => {
                  setSelectedDraft(draft.id)
                  loadTemplateInfo({ variables: { id: draft.id } })
                }}
              >
                {`${draft.summary} (${getRelativeTimeFromNow(draft.createdAt)})`}
              </li>
            ))}
          </ul>
        </div>

        {selectedDraft && (
          <div className='relative flex h-100 flex-col'>
            {loadingDraft || !draft ? (
              <Spinner className='absolute inset-0 m-auto' />
            ) : (
              <>
                <Tiptap
                  className='-mx-2 my-2 flex-grow overflow-y-auto'
                  editable={false}
                  content={draft.draft.content}
                />
                <ThemedButton
                  className='h-8 shrink-0 rounded-none'
                  color='primary'
                  variant='flat'
                  disabled={deleting}
                  onClick={() => {
                    setSelectedDraft(undefined)
                    onSelect?.(draft.draft)
                    setIsOpen(false)
                  }}
                >
                  불러오기
                </ThemedButton>

                <ThemedButton
                  className='h-8 shrink-0 rounded-t-none'
                  color='error'
                  variant='text'
                  disabled={deleting}
                  onClick={deleteDraft}
                >
                  {deleting ? <Spinner size='xs' /> : '삭제'}
                </ThemedButton>
              </>
            )}
          </div>
        )}
      </div>
    </PopoverMenu>
  )
}
