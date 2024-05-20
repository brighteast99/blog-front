import {
  TypedDocumentNode,
  gql,
  useLoadableQuery,
  useMutation,
  useQuery
} from '@apollo/client'
import clsx from 'clsx'
import { Spinner } from 'components/Spinner'
import { FC, Suspense, useCallback, useEffect, useState } from 'react'
import { Template, BlogInfo as _BlogInfo } from 'types/data'
import { TemplateForm } from './templateForm'
import Icon from '@mdi/react'
import { mdiPlus } from '@mdi/js'
import { ThemedButton } from 'components/Buttons/ThemedButton'

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
  const { data, loading } = useQuery(GET_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<number>()
  const [loadTemplateInfo, queryRef, { reset }] = useLoadableQuery(
    GET_TEMPLATE,
    {
      fetchPolicy: 'cache-and-network'
    }
  )
  const [_createTemplate, { loading: creating, reset: resetCreateMutation }] =
    useMutation(CREATE_TEMPLATE)

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
      onCompleted: ({ createTemplate: { createdTemplate } }) => {
        setSelectedTemplate(createdTemplate.id)
        loadTemplateInfo({ id: createdTemplate.id })
      },
      onError: () => {
        alert('템플릿 생성 중 오류가 발생했습니다.')
        resetCreateMutation()
      }
    })
  }, [_createTemplate, loadTemplateInfo, resetCreateMutation])

  return (
    <div className='flex gap-2 p-5 *:h-[58rem]'>
      <div className='w-1/3'>
        {loading && <Spinner className='absolute inset-0' size='sm' />}
        {data && (
          <div
            className='relative h-full overflow-y-auto rounded border border-neutral-200 bg-neutral-50'
            onClick={(e) => {
              if (e.target !== e.currentTarget) return
              console.log('a')
              setSelectedTemplate(undefined)
              reset()
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
            <ul className='text-lg *:px-2 *:py-1'>
              {data?.templateList.map((template) => (
                <li
                  className={clsx(
                    selectedTemplate === template.id
                      ? 'bg-primary bg-opacity-25 hover:brightness-125'
                      : 'hover:bg-neutral-100'
                  )}
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    loadTemplateInfo({ id: template.id })
                  }}
                >
                  {template.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className='relative w-2/3'>
        <Suspense fallback={<Spinner className='absolute inset-0' />}>
          {queryRef ? (
            <TemplateForm
              queryRef={queryRef}
              onDelete={() => {
                setSelectedTemplate(undefined)
                reset()
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
