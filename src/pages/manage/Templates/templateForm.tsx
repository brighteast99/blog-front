import { useCallback, useEffect } from 'react'

import { useMutation, useReadQuery } from '@apollo/client'
import {
  DELETE_TEMPLATE,
  GET_TEMPLATE,
  GET_TEMPLATES,
  UPDATE_TEMPLATE
} from './api'

import { usePostInput as useTemplateInput } from 'pages/post/Edit/hooks'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'
import { Tiptap } from 'components/Tiptap'
import { NavigationBlocker } from 'components/utils/NavigationBlocker'

import type { FC, MouseEvent } from 'react'
import type { QueryRef } from '@apollo/client'
import type { Template } from 'types/data'

export const TemplateForm: FC<{
  queryRef: QueryRef<{ template: Template }, { id: number }>
  onDelete?: () => any
}> = ({ queryRef, onDelete }) => {
  const {
    input: { title, content, textContent, thumbnail, images },
    isModified,
    initialize,
    setTitle,
    setContent,
    setTextContent,
    setThumbnail,
    addImage,
    removeImage
  } = useTemplateInput({
    title: '',
    isHidden: false,
    content: '<p></p>',
    textContent: '',
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
          textContent,
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
          textContent: template.textContent,
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
          onChange={(e) => setTitle(e.target.value)}
        />
        <Tiptap
          content={content}
          thumbnail={thumbnail}
          images={images}
          onChange={(editor) => {
            setContent(editor.getHTML())
            setTextContent(editor.getText())
          }}
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
