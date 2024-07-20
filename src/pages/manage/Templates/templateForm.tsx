import {
  QueryReference,
  TypedDocumentNode,
  gql,
  useMutation,
  useReadQuery
} from '@apollo/client'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'
import { usePostInput } from 'pages/post/Edit'
import { FC, MouseEvent, useCallback, useEffect } from 'react'
import { Template } from 'types/data'
import { GET_TEMPLATE, GET_TEMPLATES, TemplateInput } from '.'
import { Tiptap } from 'components/Tiptap'
import { NavigationBlocker } from 'components/NavigationBlocker'

export const UPDATE_TEMPLATE: TypedDocumentNode<
  { updateTemplate: { success: boolean } },
  { id: number; data: TemplateInput }
> = gql`
  mutation UpdateTemplate($id: Int!, $data: TemplateInput!) {
    updateTemplate(id: $id, data: $data) {
      success
    }
  }
`

export const DELETE_TEMPLATE: TypedDocumentNode<
  { updateTemplate: { success: boolean } },
  { id: number }
> = gql`
  mutation DeleteTemplate($id: Int!) {
    deleteTemplate(id: $id) {
      success
    }
  }
`

export const TemplateForm: FC<{
  queryRef: QueryReference<{ template: Template }, { id: number }>
  onDelete?: () => any
}> = ({ queryRef, onDelete }) => {
  const {
    input: { title, content, thumbnail, images },
    isModified,
    initialize,
    setTitle: setName,
    setContent,
    setThumbnail,
    addImage,
    removeImage
  } = usePostInput({
    title: '',
    isHidden: false,
    content: '<p></p>',
    images: []
  })
  const {
    data: { template }
  } = useReadQuery(queryRef)
  const [_updateTemplate, { loading: updating, reset: resetUpdateMutation }] =
    useMutation(UPDATE_TEMPLATE)

  const [_deleteTemplate, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_TEMPLATE)

  function updateTemplate(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    _updateTemplate({
      variables: {
        id: template.id,
        data: {
          title,
          content,
          thumbnail: thumbnail,
          images: images
        }
      },
      refetchQueries: [
        {
          query: GET_TEMPLATES
        },
        {
          query: GET_TEMPLATE,
          variables: { id: template.id }
        }
      ],
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('템플릿 수정 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetUpdateMutation()
      }
    })
  }

  const deleteTemplate = useCallback(() => {
    if (!window.confirm(`'${template.title}' 템플릿을 삭제합니다.`)) return

    _deleteTemplate({
      variables: {
        id: template.id
      },
      refetchQueries: [
        {
          query: GET_TEMPLATES
        }
      ],
      onCompleted: () => onDelete?.(),
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('템플릿 삭제 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetDeleteMutation()
      }
    })
  }, [
    _deleteTemplate,
    onDelete,
    resetDeleteMutation,
    template.id,
    template.title
  ])

  useEffect(() => {
    if (template)
      initialize(
        {
          title: template.title,
          content: template.content,
          isHidden: false,
          thumbnail: template.thumbnail,
          images: template.images
        },
        false
      )
  }, [template, initialize])

  return (
    <>
      <NavigationBlocker
        enabled={isModified}
        localAlert
        message={'수정 중인 내용이 있습니다.\n계속하시겠습니까?'}
      />
      <div className='flex size-full flex-col gap-2'>
        <input
          className='w-full px-1 text-2xl'
          type='text'
          value={title}
          placeholder={template.title}
          onChange={(e) => setName(e.target.value)}
        />
        <Tiptap
          content={content}
          thumbnail={thumbnail}
          images={images}
          onChange={(editor) => setContent(editor.getHTML())}
          onChangeThumbnail={setThumbnail}
          onAddImage={addImage}
          onDeleteImage={removeImage}
        />
        <ThemedButton
          className='h-12 w-full'
          type='submit'
          variant='flat'
          color='primary'
          disabled={updating || deleting}
          onClick={updateTemplate}
        >
          {updating ? <Spinner size='xs' /> : '저장'}
        </ThemedButton>
        <ThemedButton
          className='h-12 w-full'
          type='button'
          variant='text'
          color='error'
          disabled={updating || deleting}
          onClick={deleteTemplate}
        >
          {deleting ? <Spinner size='xs' /> : '삭제'}
        </ThemedButton>
      </div>
    </>
  )
}
