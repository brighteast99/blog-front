import { useCallback, useLayoutEffect } from 'react'

import { useMutation, useReadQuery } from '@apollo/client'
import {
  DELETE_TEMPLATE,
  GET_TEMPLATE,
  GET_TEMPLATES,
  UPDATE_TEMPLATE
} from './api'

import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Tiptap } from 'components/Tiptap'
import { NavigationBlocker } from 'components/utils/NavigationBlocker'
import { useTemplateInput } from './hooks'

import type { FC, MouseEvent } from 'react'
import type { QueryRef } from '@apollo/client'
import type { Template } from 'types/data'

export const TemplateForm: FC<{
  queryRef: QueryRef<{ template: Template }, { id: number }>
  onDelete?: () => any
}> = ({ queryRef, onDelete }) => {
  const {
    data: { template }
  } = useReadQuery(queryRef)
  const [
    _updateTemplate,
    {
      loading: updating,
      error: errorUpdatingTemplate,
      reset: resetUpdateMutation
    }
  ] = useMutation(UPDATE_TEMPLATE)
  const {
    templateInput: {
      templateName,
      title,
      content,
      textContent,
      thumbnail,
      images,
      tags
    },
    hasChange,
    initialize,
    setTemplateName,
    setTitle,
    setContent,
    setTextContent,
    setThumbnail,
    addImage,
    addImages,
    removeImage
  } = useTemplateInput(template)

  const [_deleteTemplate, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_TEMPLATE)

  function updateTemplate(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    _updateTemplate({
      variables: {
        id: template.id,
        data: {
          templateName,
          title,
          content,
          textContent,
          thumbnail: thumbnail,
          images: images,
          tags: tags
        }
      },
      refetchQueries: [
        { query: GET_TEMPLATES },
        { query: GET_TEMPLATE, variables: { id: template.id } }
      ],
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('템플릿 수정 중 오류가 발생했습니다.')
        if (graphQLErrors.length) alert(graphQLErrors[0].message)
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
      refetchQueries: [{ query: GET_TEMPLATES }],
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

  useLayoutEffect(() => {
    initialize(template)
  }, [template, initialize])

  return (
    <>
      <NavigationBlocker
        enabled={hasChange}
        localAlert
        message={'수정 중인 내용이 있습니다.\n계속하시겠습니까?'}
      />
      <div className='flex min-h-full flex-col gap-2'>
        <input
          className='mb-3 w-full px-1 text-2xl'
          type='text'
          value={templateName}
          placeholder={template.templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
        <input
          className='w-full px-1 text-2xl'
          type='text'
          placeholder={template.title}
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Tiptap
          key={template.id}
          className='min-h-0 grow'
          content={content}
          status={
            updating
              ? 'saving'
              : errorUpdatingTemplate
                ? 'error'
                : hasChange
                  ? 'need-save'
                  : 'saved'
          }
          thumbnail={thumbnail}
          images={images}
          onChange={(editor) => {
            setContent(editor.getHTML())
            setTextContent(editor.getText())
          }}
          onImageUploaded={addImage}
          onImageImported={addImages}
          onImageDeleted={removeImage}
          onChangeThumbnail={setThumbnail}
        />
        <ThemedButton
          className='h-10 w-full shrink-0'
          type='submit'
          variant='flat'
          color='primary'
          disabled={deleting}
          loading={updating}
          spinnerSize='xs'
          onClick={updateTemplate}
        >
          저장
        </ThemedButton>
        <ThemedButton
          className='h-10 w-full shrink-0'
          type='button'
          variant='text'
          color='error'
          disabled={updating}
          loading={deleting}
          spinnerSize='xs'
          onClick={deleteTemplate}
        >
          삭제
        </ThemedButton>
      </div>
    </>
  )
}
