import { Suspense, useCallback, useLayoutEffect, useMemo } from 'react'
import clsx from 'clsx'
import { ErrorBoundary } from 'react-error-boundary'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useLoadableQuery, useMutation, useQuery } from '@apollo/client'
import { CREATE_TEMPLATE, GET_TEMPLATE, GET_TEMPLATES } from './api'

import Icon from '@mdi/react'
import { mdiPlus } from '@mdi/js'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Error } from 'components/Error'
import { Spinner } from 'components/Spinner'
import { TemplateForm } from './templateForm'

import type { FC } from 'react'

export const ManageTemplatePage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const {
    data,
    loading: loadingTemplates,
    error: errorLoadingTemplates,
    refetch: refetchTemplates
  } = useQuery(GET_TEMPLATES, {
    notifyOnNetworkStatusChange: true
  })
  const templates = useMemo(() => data?.templates, [data])

  const [
    loadTemplate,
    queryRef,
    { reset: resetTemplate, refetch: refetchTemplate }
  ] = useLoadableQuery(GET_TEMPLATE)

  const [_createTemplate, { loading: creating, reset: resetCreateMutation }] =
    useMutation(CREATE_TEMPLATE)
  const selectedTemplate =
    Number.parseInt(searchParams.get('template') ?? '0') || undefined

  const selectTemplate = useCallback(
    (id?: number, forced?: boolean) => {
      if (forced) {
        if (id) searchParams.set('template', id.toString())
        else searchParams.delete('template')
        setSearchParams(searchParams, { replace: true })
        return
      }

      return navigate(id ? `?template=${id}` : '.', { replace: true })
    },
    [navigate, searchParams, setSearchParams]
  )

  const createTemplate = useCallback(
    () =>
      _createTemplate({
        variables: {
          data: {
            title: '새 템플릿',
            content: '<p></p>',
            textContent: '',
            images: []
          }
        },
        refetchQueries: [{ query: GET_TEMPLATES }],
        onCompleted: ({ createTemplate: { createdTemplate } }) =>
          selectTemplate(createdTemplate.id),
        onError: ({ networkError, graphQLErrors }) => {
          if (networkError) alert('템플릿 생성 중 오류가 발생했습니다.')
          if (graphQLErrors.length) alert(graphQLErrors[0].message)
          resetCreateMutation()
        }
      }),
    [_createTemplate, resetCreateMutation, selectTemplate]
  )

  useLayoutEffect(() => {
    if (!selectedTemplate) resetTemplate()
    else
      loadTemplate({
        id: selectedTemplate
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate])

  return (
    <div className='flex justify-center gap-2 p-5'>
      <div className='w-1/3'>
        <div className='relative h-full overflow-y-auto rounded border border-neutral-200 bg-neutral-50'>
          {loadingTemplates && (
            <Spinner className='absolute inset-0' size='sm' />
          )}
          {errorLoadingTemplates && (
            <div className='absolute inset-0'>
              <Error
                code={500}
                hideDefaultAction
                actions={[{ label: '다시 시도', handler: refetchTemplates }]}
              />
            </div>
          )}
          {templates && (
            <>
              <ThemedButton
                className='h-10 w-full'
                variant='text'
                color='primary'
                loading={creating}
                spinnerSize='xs'
                onClick={createTemplate}
              >
                <Icon className='-mt-1 mr-1 inline' path={mdiPlus} size={1} />새
                템플릿
              </ThemedButton>
              <ul className='text-lg'>
                {templates.map((template) => (
                  <li
                    className={
                      selectedTemplate === template.id
                        ? 'bg-primary bg-opacity-25 hover:brightness-125'
                        : 'hover:bg-neutral-100'
                    }
                    key={template.id}
                  >
                    <Link
                      className={clsx(
                        'block size-full px-2 py-1',
                        selectedTemplate === template.id &&
                          'pointer-events-none'
                      )}
                      to={`?template=${template.id}`}
                      replace
                    >
                      {template.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className='relative w-2/3 max-w-[1280px]'>
        <ErrorBoundary
          FallbackComponent={({ resetErrorBoundary }) => (
            <Error
              message='템플릿을 불러오지 못했습니다'
              hideDefaultAction
              actions={[
                {
                  label: '다시 시도',
                  handler: () => {
                    refetchTemplate()
                    resetErrorBoundary()
                  }
                }
              ]}
            />
          )}
        >
          <Suspense fallback={<Spinner className='absolute inset-0' />}>
            {queryRef ? (
              <TemplateForm
                queryRef={queryRef}
                onDelete={() => {
                  selectTemplate(undefined, true)
                }}
              />
            ) : (
              <span className='absolute inset-0 m-auto block size-fit text-xl text-neutral-400'>
                편집할 템플릿을 선택하세요
              </span>
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
