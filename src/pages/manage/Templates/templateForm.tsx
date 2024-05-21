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
    input: { title: name, content, thumbnail, images },
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
          name,
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
      onError: () => {
        alert('템플릿 수정 중 오류가 발생했습니다.')
        resetUpdateMutation()
      }
    })
  }

  const deleteTemplate = useCallback(() => {
    if (!window.confirm(`'${template.name}' 템플릿을 삭제합니다.`)) return

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
      onError: () => {
        alert('템플릿 삭제 중 문제가 발생했습니다.')
        resetDeleteMutation()
      }
    })
  }, [
    _deleteTemplate,
    onDelete,
    resetDeleteMutation,
    template.id,
    template.name
  ])

  useEffect(() => {
    if (template)
      initialize({
        title: template.name,
        content: template.content,
        isHidden: false,
        thumbnail: template.thumbnail,
        images: template.images
      })
  }, [template, initialize])

  return (
    <div className='flex size-full flex-col gap-2'>
      <input
        className='w-full px-1 text-2xl'
        type='text'
        value={name}
        placeholder={template.name}
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
  )
}
