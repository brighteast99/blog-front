import { useCallback, useMemo, useState } from 'react'
import { Placement } from '@floating-ui/react'
import clsx from 'clsx'

import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { DELETE_DRAFT, GET_DRAFT, GET_DRAFTS } from './api'

import { useToggle } from 'hooks/useToggle'
import { getRelativeTimeFromNow } from 'utils/dayJS'

import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Error } from 'components/Error'
import { PopoverMenu } from 'components/PopoverMenu'
import { Spinner } from 'components/Spinner'
import { Tiptap } from 'components/Tiptap'

import type { FC, ReactNode } from 'react'
import type { Draft } from 'types/data'

interface DraftManagerProps {
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
  const { value: isOpen, setTrue: open, setFalse: close } = useToggle(false)

  const {
    data: draftsData,
    loading: loadingDrafts,
    error: errorLoadingDrafts,
    refetch: refetchDrafts
  } = useQuery(GET_DRAFTS, { notifyOnNetworkStatusChange: true })
  const drafts = useMemo(() => draftsData?.drafts, [draftsData])

  const [
    loadDraft,
    {
      data: draftData,
      loading: loadingDraft,
      error: errorLoadingDraft,
      refetch: refetchDraft
    }
  ] = useLazyQuery(GET_DRAFT, { notifyOnNetworkStatusChange: true })
  const draft = useMemo(() => draftData?.draft, [draftData])
  const [selectedDraft, setSelectedDraft] = useState<number>()

  const [_deleteDraft, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_DRAFT)

  const deleteDraft = useCallback(() => {
    if (!draft) return
    if (!window.confirm(`임시 저장본 '${draft.summary}'을(를) 삭제합니다.`))
      return

    _deleteDraft({
      variables: { id: Number(draft.id) },
      refetchQueries: [{ query: GET_DRAFTS }],
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
          disabled={loadingDrafts || !drafts?.length}
          color='primary'
        >
          {loadingDrafts ? (
            <Spinner size='xs' />
          ) : (
            `임시 저장본 ${drafts?.length ? `(${drafts?.length})` : '없음'}`
          )}
        </ThemedButton>
      }
      onOpen={open}
      onClose={close}
    >
      <div className='w-120 max-w-[90dvw] bg-neutral-50'>
        <div className='relative flex h-40 flex-col border-b border-neutral-100'>
          <div className='border-b border-neutral-100 bg-neutral-100 py-1 text-center'>
            임시 저장본 목록
          </div>
          {loadingDrafts && <Spinner className='absolute inset-0' size='sm' />}
          {errorLoadingDrafts && (
            <div className='absolute inset-0'>
              <Error
                code={500}
                hideDefaultAction
                actions={[{ label: '다시 시도', handler: refetchDrafts }]}
              />
            </div>
          )}
          {drafts && (
            <ul className='min-h-0 grow overflow-y-auto'>
              {drafts.map((draft) => (
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
                    loadDraft({ variables: { id: draft.id } })
                  }}
                >
                  {`${draft.summary} (${getRelativeTimeFromNow(draft.createdAt)})`}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedDraft && (
          <div className='relative flex h-100 flex-col'>
            {loadingDraft && <Spinner className='absolute inset-0 m-auto' />}
            {errorLoadingDraft && (
              <div className='absolute inset-0'>
                <Error
                  code={500}
                  hideDefaultAction
                  actions={[{ label: '다시 시도', handler: refetchDraft }]}
                />
              </div>
            )}
            {draft && (
              <>
                <Tiptap
                  className='-mx-2 my-2 flex-grow overflow-y-auto'
                  editable={false}
                  content={draft.content}
                />
                <ThemedButton
                  className='h-8 shrink-0 rounded-none'
                  color='primary'
                  variant='flat'
                  disabled={deleting}
                  onClick={() => {
                    setSelectedDraft(undefined)
                    onSelect?.(draft)
                    close()
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
export { GET_DRAFTS }
