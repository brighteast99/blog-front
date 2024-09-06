import { Suspense, useCallback, useLayoutEffect, useMemo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useLoadableQuery, useMutation, useQuery } from '@apollo/client'
import { CREATE_TEMPLATE, GET_TEMPLATE, GET_TEMPLATES } from './api'

import { mdiPlus } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
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
            templateName: '새 템플릿',
            title: '제목',
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
    <div className='flex flex-col divide-y divide-neutral-200'>
      <div className='relative m-4 flex gap-2 rounded border border-neutral-200 bg-background p-1 focus-within:border-primary'>
        {loadingTemplates && <Spinner className='mx-auto' size='sm' />}
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
            <select
              className='grow border-b-0 p-1.5 text-lg'
              onChange={(e) =>
                navigate(`?template=${e.target.value}`, { replace: true })
              }
            >
              <option value=''>템플릿 선택</option>
              {templates.map((template) => (
                <option
                  className={
                    selectedTemplate === template.id
                      ? 'bg-primary bg-opacity-25 hover:brightness-125'
                      : 'hover:bg-neutral-100'
                  }
                  key={template.id}
                  value={template.id}
                >
                  {template.templateName}
                </option>
              ))}
            </select>
            <IconButton
              variant='text'
              color='primary'
              path={mdiPlus}
              loading={creating}
              spinnerSize='xs'
              size={1}
              tooltip='새 템플릿'
              onClick={createTemplate}
            ></IconButton>
          </>
        )}
      </div>

      <div className='relative grow p-5'>
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
