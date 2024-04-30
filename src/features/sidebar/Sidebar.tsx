import { FC, useLayoutEffect, Suspense } from 'react'
import clsx from 'clsx'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { expand, selectSidebarIsFolded } from './sidebarSlice'
import { ErrorBoundary } from 'react-error-boundary'
import { Avatar } from 'components/Avatar'
import { Spinner } from 'components/Spinner'
import { CategoryList } from './CategoryList'
import { Error } from 'components/Error'
import { TypedDocumentNode, gql, useLoadableQuery } from '@apollo/client'

export type CategoryListQueryResult = { categoryList: string }

const GET_CATEGORIES: TypedDocumentNode<CategoryListQueryResult> = gql`
  query CategoryList {
    categoryList
  }
`

export interface SidebarProps {
  /**
   * Is sidebar foldable or not.
   * Mobile, Tablet: true / Desktop: False
   */
  foldable?: boolean
}

export const Sidebar: FC<SidebarProps> = ({ foldable = false }) => {
  const dispatch = useAppDispatch()
  const isFolded = useAppSelector(selectSidebarIsFolded)
  const [loadCategories, queryRef, { refetch }] =
    useLoadableQuery(GET_CATEGORIES)

  useLayoutEffect(() => {
    dispatch(expand())
  }, [dispatch, foldable])

  useLayoutEffect(() => {
    if (!queryRef) loadCategories()
  }, [queryRef, loadCategories])

  return (
    <div
      className={clsx(
        'h-full w-72 overflow-hidden bg-neutral-200 transition-[max-width,min-width]',
        isFolded ? 'min-w-0 max-w-0' : 'min-w-72 max-w-72'
      )}
    >
      <div className='mx-4 flex size-full w-64 flex-col py-8'>
        <Avatar className='mx-auto mb-2 shrink-0' size='2xl' />
        <p className='text-center text-lg font-semibold'>기록장</p>
        <p className='text-center'>블로그 소개</p>

        <hr className='mb-4 mt-2' />

        <div className='relative min-h-0 grow overflow-y-auto'>
          <ErrorBoundary
            FallbackComponent={({ resetErrorBoundary }) => (
              <Error
                message='오류가 발생했습니다'
                hideDefaultAction
                actions={[
                  {
                    label: '다시 시도',
                    handler: () => {
                      refetch()
                      resetErrorBoundary()
                    }
                  }
                ]}
              />
            )}
          >
            <Suspense
              fallback={<Spinner size='sm' className='absolute inset-0' />}
            >
              {queryRef && <CategoryList queryRef={queryRef} />}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
