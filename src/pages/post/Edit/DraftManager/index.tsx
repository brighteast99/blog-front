import { useCallback, useEffect, useMemo, useState } from 'react'
import { Placement } from '@floating-ui/react'
import clsx from 'clsx'

import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { DELETE_DRAFT, GET_DRAFT, GET_DRAFTS } from './api'

import { useAppSelector } from 'store/hooks'
import { selectIsAuthenticatedAndActive } from 'store/slices/auth/authSlice'
import { useToggle } from 'hooks/useToggle'
import { getRelativeTimeFromNow } from 'utils/dayJS'

import { mdiDelete, mdiPound } from '@mdi/js'
import { Badge } from 'components/Badge'
import { IconButton } from 'components/Buttons/IconButton'
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
  activeDraft?: number
  onSelect?: (data: Draft) => any
  onDelete?: (id: number) => any
}

export const DraftManager: FC<DraftManagerProps> = ({
  className,
  placement = 'bottom-start',
  tooltipPlacement = 'bottom',
  description,
  activeDraft,
  onSelect,
  onDelete
}) => {
  const { value: isOpen, setTrue: open, setFalse: close } = useToggle(false)
  const isLoggedIn = useAppSelector(selectIsAuthenticatedAndActive)

  const {
    data: draftsData,
    loading: loadingDrafts,
    error: errorLoadingDrafts,
    refetch: refetchDrafts
  } = useQuery(GET_DRAFTS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    skip: !isLoggedIn
  })
  const drafts = useMemo(() => draftsData?.drafts, [draftsData])

  const [
    loadDraft,
    {
      data: draftData,
      loading: loadingDraft,
      error: errorLoadingDraft,
      refetch: refetchDraft
    }
  ] = useLazyQuery(GET_DRAFT, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network'
  })
  const draft = useMemo(() => draftData?.draft, [draftData])
  const [selectedDraft, setSelectedDraft] = useState<number>()

  const [_deleteDraft, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_DRAFT)

  const deleteDraft = useCallback(
    ({ summary, id }: Draft) => {
      if (!window.confirm(`임시 저장본 '${summary}'을(를) 삭제합니다.`)) return

      _deleteDraft({
        variables: { id },
        refetchQueries: [{ query: GET_DRAFTS }],
        onCompleted: () => {
          setSelectedDraft(undefined)
          onDelete?.(id)
        },
        onError: ({ networkError, graphQLErrors }) => {
          if (networkError) alert('임시 저장본 삭제 중 오류가 발생했습니다.')
          else if (graphQLErrors.length) alert(graphQLErrors[0].message)
          resetDeleteMutation()
        }
      })
    },
    [_deleteDraft, onDelete, resetDeleteMutation]
  )

  useEffect(() => {
    if (!drafts?.length) close()
  }, [drafts, close])

  return (
    <PopoverMenu
      className={className}
      open={isOpen}
      placement={placement}
      offset={-24}
      tooltipPlacement={tooltipPlacement}
      description={description}
      menuBtn={
        <ThemedButton
          className='h-8 px-2'
          variant='hover-text'
          disabled={!drafts?.length}
          loading={loadingDrafts}
          spinnerSize='xs'
          color='primary'
        >
          {`임시 저장본 ${drafts?.length ? `(${drafts?.length})` : '없음'}`}
        </ThemedButton>
      }
      onOpen={open}
      onClose={() => {
        close()
        setSelectedDraft(undefined)
      }}
    >
      <div className='w-120 max-w-[90dvw] bg-neutral-50'>
        <div className='relative flex max-h-40 flex-col'>
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
            <ul className='min-h-0 grow overflow-y-auto px-2 py-1.5'>
              {drafts.map((draft) => (
                <li
                  className={clsx(
                    'flex items-center px-1 py-0.5',
                    selectedDraft !== draft.id &&
                      'text-neutral-600 hover:text-foreground'
                  )}
                  key={draft.id}
                  onClick={() => {
                    setSelectedDraft(draft.id)
                    loadDraft({ variables: { id: draft.id } })
                  }}
                >
                  <p
                    className={clsx(
                      'truncate transition-colors',
                      selectedDraft === draft.id && 'text-primary'
                    )}
                  >
                    {draft.summary}
                  </p>
                  <p
                    className={clsx(
                      'ml-1 text-nowrap transition-colors',
                      selectedDraft === draft.id && 'text-primary'
                    )}
                  >
                    {`(${getRelativeTimeFromNow(draft.updatedAt)}${activeDraft === draft.id ? ', 편집중' : ''})`}
                  </p>
                  <div className='grow' />
                  <IconButton
                    path={mdiDelete}
                    variant='hover-text'
                    color='error'
                    iconProps={{ horizontal: true }}
                    size={0.7}
                    tooltip='삭제'
                    tooltipOptions={{ placement: 'right' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteDraft(draft)
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedDraft && (
          <div className='relative flex h-100 flex-col border-t border-neutral-200'>
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
                <div className='flex min-h-9 flex-wrap items-center gap-0.5 border-t border-dashed border-neutral-200 p-1'>
                  {draft.tags.map((tag) => (
                    <Badge key={tag} size='xs' icon={mdiPound}>
                      {tag}
                    </Badge>
                  ))}
                  {draft.tags.length === 0 && (
                    <span className='text-sm text-neutral-600'>
                      태그 미지정
                    </span>
                  )}
                </div>
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
              </>
            )}
          </div>
        )}
      </div>
    </PopoverMenu>
  )
}
export { GET_DRAFTS }
