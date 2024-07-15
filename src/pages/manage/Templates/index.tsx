import { FC, Suspense, useCallback, useLayoutEffect } from 'react'
import {
  TypedDocumentNode,
  gql,
  useLoadableQuery,
  useMutation,
  useQuery
} from '@apollo/client'
import clsx from 'clsx'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Template, BlogInfo as _BlogInfo } from 'types/data'
import Icon from '@mdi/react'
import { mdiPlus } from '@mdi/js'
import { Spinner } from 'components/Spinner'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { TemplateForm } from './templateForm'

export interface TemplateInput extends Omit<Template, 'id'> {}

export const GET_TEMPLATES: TypedDocumentNode<{ templateList: Template[] }> =
  gql`
    query GetTemplates {
      templateList {
        id
        name
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
      name
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
          name: '새 템플릿',
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
      onError: () => {
        alert('템플릿 생성 중 오류가 발생했습니다.')
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
              {data?.templateList.map((template) => (
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
                    {template.name}
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
