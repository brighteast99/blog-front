import { FC, Suspense, useCallback, useLayoutEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  gql,
  TypedDocumentNode,
  useLoadableQuery,
  useMutation,
  useQuery
} from '@apollo/client'
import clsx from 'clsx'
import { mdiPlus } from '@mdi/js'
import Icon from '@mdi/react'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'
import { TemplateForm } from './templateForm'

import type { BlogInfo as _BlogInfo, Template } from 'types/data'

export interface TemplateInput extends Omit<Template, 'id'> {}

export const GET_TEMPLATES: TypedDocumentNode<{ templates: Template[] }> = gql`
  query GetTemplates {
    templates {
      id
      title
    }
  }
`

export const GET_TEMPLATE: TypedDocumentNode<
  { template: Template },
  { id: number }
> = gql`
  query GetTemplate($id: Int!) {
    template(id: $id) {
      id
      title
      content
      thumbnail
      images
    }
  }
`

const CREATE_TEMPLATE: TypedDocumentNode<
  { createTemplate: { createdTemplate: Template } },
  { data: TemplateInput }
> = gql`
  mutation CreateTemplate($data: TemplateInput!) {
    createTemplate(data: $data) {
      createdTemplate {
        id
      }
    }
  }
`

export const ManageTemplatePage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data, loading } = useQuery(GET_TEMPLATES)
  const [loadTemplateInfo, queryRef, { reset }] = useLoadableQuery(
    GET_TEMPLATE,
    {
      fetchPolicy: 'cache-and-network'
    }
  )
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

  const createTemplate = useCallback(() => {
    _createTemplate({
      variables: {
        data: {
          title: '새 템플릿',
          content: '<p></p>',
          images: []
        }
      },
      refetchQueries: [
        {
          query: GET_TEMPLATES
        }
      ],
      onCompleted: ({ createTemplate: { createdTemplate } }) =>
        selectTemplate(createdTemplate.id),
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('템플릿 생성 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetCreateMutation()
      }
    })
  }, [_createTemplate, resetCreateMutation, selectTemplate])

  useLayoutEffect(() => {
    if (!selectedTemplate) reset()
    else
      loadTemplateInfo({
        id: selectedTemplate
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate])

  return (
    <div className='flex justify-center gap-2 p-5 *:h-[55rem]'>
      <div className='w-1/3'>
        {loading && <Spinner className='absolute inset-0' size='sm' />}
        {data && (
          <div
            className='relative h-full overflow-y-auto rounded border border-neutral-200 bg-neutral-50'
            onClick={(e) => {
              if (e.target !== e.currentTarget) return
              selectTemplate(undefined)
            }}
          >
            {loading && <Spinner className='absolute inset-0' size='sm' />}
            <ThemedButton
              className='h-12 w-full'
              variant='text'
              color='primary'
              disabled={creating}
              onClick={createTemplate}
            >
              {creating ? (
                <Spinner size='xs' />
              ) : (
                <>
                  <Icon className='-mt-1 mr-1 inline' path={mdiPlus} size={1} />
                  새 템플릿
                </>
              )}
            </ThemedButton>
            <ul className='text-lg'>
              {data?.templates.map((template) => (
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
                      selectedTemplate === template.id && 'pointer-events-none'
                    )}
                    to={`?template=${template.id}`}
                    replace
                  >
                    {template.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className='relative w-2/3 max-w-[1280px]'>
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
      </div>
    </div>
  )
}
