import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { debounce } from 'throttle-debounce'

import { useLazyQuery, useMutation, useReadQuery } from '@apollo/client'
import { SEARCH_HASHTAGS } from 'api/hashtag'
import {
  DELETE_TEMPLATE,
  GET_TEMPLATE,
  GET_TEMPLATES,
  UPDATE_TEMPLATE
} from 'api/template'

import { useDialog } from 'hooks/useDialog'
import { useNavigationBlocker } from 'hooks/useNavigationBlocker'

import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Combobox } from 'components/Controls/Combobox'
import { Tiptap } from 'components/Tiptap'
import { useTemplateInput } from './hooks'

import type { FC, MouseEvent } from 'react'
import type { QueryRef } from '@apollo/client'
import type { Hashtag, Template } from 'types/data'

export const TemplateForm: FC<{
  queryRef: QueryRef<{ template: Template }, { id: number }>
  onDelete?: () => any
}> = ({ queryRef, onDelete }) => {
  const { block, unblock } = useNavigationBlocker()

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
    setTags,
    addImage,
    addImages,
    removeImage
  } = useTemplateInput(template)
  const showDialog = useDialog()

  const [loadHashtags, { loading: loadingHashtags, data: _hashtagData }] =
    useLazyQuery(SEARCH_HASHTAGS, { fetchPolicy: 'cache-and-network' })
  const [hashtagData, setHashtagData] = useState<Hashtag[]>([])
  const hashtags = useMemo(
    () => hashtagData.map((hashtag) => hashtag.name) ?? [],
    [hashtagData]
  )
  const [_deleteTemplate, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_TEMPLATE)

  const searchHashtags = useMemo(
    () =>
      debounce(250, (keyword: string) => {
        loadHashtags({
          variables: {
            keyword,
            limit: 5
          }
        }).then(({ data }) => setHashtagData(data?.hashtags ?? []))
      }),
    [loadHashtags, setHashtagData]
  )

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
          thumbnail,
          images,
          tags
        }
      },
      refetchQueries: [
        { query: GET_TEMPLATES },
        { query: GET_TEMPLATE, variables: { id: template.id } }
      ],
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) showDialog('템플릿 수정 중 오류가 발생했습니다.')
        if (graphQLErrors.length) showDialog(graphQLErrors[0].message)
        resetUpdateMutation()
      }
    })
  }

  const deleteTemplate = useCallback(async () => {
    if (
      !(await showDialog(
        `'${template.title}' 템플릿을 삭제합니다.`,
        'NEGATIVECONFIRM'
      ))
    )
      return

    _deleteTemplate({
      variables: {
        id: template.id
      },
      refetchQueries: [{ query: GET_TEMPLATES }],
      onCompleted: () => onDelete?.(),
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) showDialog('템플릿 삭제 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) showDialog(graphQLErrors[0].message)
        resetDeleteMutation()
      }
    })
  }, [
    _deleteTemplate,
    onDelete,
    resetDeleteMutation,
    template.id,
    template.title,
    showDialog
  ])

  useLayoutEffect(() => {
    initialize(template)
  }, [template, initialize])

  // * load all hashtags for the first time
  useLayoutEffect(() => {
    if (hashtagData === undefined) searchHashtags('')
  }, [hashtagData, searchHashtags])

  // * block navigation if there are some changes
  useLayoutEffect(() => {
    if (hasChange) block()
    else unblock()
  }, [hasChange, block, unblock])

  return (
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
      <Combobox
        className='mb-5 max-h-16'
        name='태그'
        value={tags}
        placeholder='태그 선택'
        allowNewValue
        items={hashtags}
        loading={loadingHashtags}
        onChange={setTags}
        onInputChange={searchHashtags}
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
  )
}
