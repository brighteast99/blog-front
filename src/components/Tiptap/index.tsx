import { useCallback, useEffect, useMemo, useState } from 'react'
import FileHandler from '@tiptap-pro/extension-file-handler'
import { Editor as CoreEditor } from '@tiptap/core'
import { history } from '@tiptap/pm/history'
import {
  BubbleMenu,
  EditorProvider,
  Editor as ReactEditor
} from '@tiptap/react'

import { useMutation } from '@apollo/client'

import { useSet } from 'hooks/useSet'
import { cn } from 'utils/handleClassName'

import {
  mdiContentSaveAlert,
  mdiContentSaveCheck,
  mdiContentSaveEdit,
  mdiLoading
} from '@mdi/js'
import { commonExtensions, editorExtensions, viewerExtensions } from './editor'
import { ImageCatalogue } from './UI/ImageCatalogue'
import { TableTools } from './UI/TableTools'
import { Toolbar } from './UI/Toolbar'

import type { FC, MouseEvent } from 'react'
import type { AnyExtension } from '@tiptap/react'

import './Tiptap.scss'

import { debounce } from 'throttle-debounce'

import { UPLOAD_IMAGE } from 'api/media'

import Icon from '@mdi/react'
import { ThemedButton } from 'components/Buttons/ThemedButton'

export type SaveStatus = 'saved' | 'need-save' | 'saving' | 'error'

interface EditorProps {
  className?: string
  content?: string
  status?: SaveStatus
  thumbnail?: string
  images?: string[]
  editable?: boolean
  autofocus?: boolean
  onChange?: (editor: ReactEditor) => any
  onImageUploaded?: (image: string) => any
  onImageImported?: (images: string[]) => any
  onImageDeleted?: (image: string) => any
  onChangeThumbnail?: (image: string | null) => any
  onClickSaveStatus?: (_?: any) => any
  onDoubleClickSaveStatus?: (_?: any) => any
}

export const Tiptap: FC<EditorProps> = ({
  className,
  content = '<p></p>',
  status,
  thumbnail,
  images = [],
  editable = true,
  autofocus = false,
  onChange,
  onImageUploaded,
  onImageImported,
  onImageDeleted,
  onChangeThumbnail,
  onClickSaveStatus,
  onDoubleClickSaveStatus
}) => {
  const [editor, setEditor] = useState<ReactEditor>()
  const [initialized, setInitialized] = useState<boolean>(false)
  const {
    value: uploadQueue,
    addItem: addUploadQueue,
    deleteItem: deleteUploadQueue
  } = useSet<File>()
  const {
    value: failedFiles,
    addItem: addFailedFile,
    deleteItem: deleteFailedFile
  } = useSet<File>()
  const [_uploadImage] = useMutation(UPLOAD_IMAGE)

  const statusIconProps = useMemo(() => {
    let path
    let spin = false

    switch (status) {
      case 'need-save':
        path = mdiContentSaveEdit
        break
      case 'saving':
        path = mdiLoading
        spin = true
        break
      case 'error':
        path = mdiContentSaveAlert
        break
      default:
        path = mdiContentSaveCheck
    }

    return {
      path,
      spin
    }
  }, [status])

  const statusColors = useMemo(() => {
    switch (status) {
      case 'saved':
        return 'primary'
      case 'need-save':
        return 'warning'
      case 'saving':
        return 'info'
      case 'error':
        return 'error'
      default:
        return 'unset'
    }
  }, [status])

  const statusTooltip = useMemo(() => {
    switch (status) {
      case 'saved':
        return '저장됨'
      case 'need-save':
        return '변경됨'
      case 'saving':
        return '저장중'
      case 'error':
        return '저장 실패'
      default:
        return ''
    }
  }, [status])

  const uploadImage = useCallback(
    (file: File) => {
      addUploadQueue(file)
      return _uploadImage({
        variables: { file },
        onError: ({ networkError, graphQLErrors }) => {
          deleteUploadQueue(file)
          addFailedFile(file)
          if (networkError) {
            return alert(`${file.name}을 업로드하던 중 오류가 발생했습니다`)
          }
          if (graphQLErrors.length)
            return alert(
              `${file.name}을 업로드할 수 없습니다.\n사유: ${graphQLErrors[0].message}`
            )
        },
        onCompleted: ({ uploadImage: { url } }) => {
          onImageUploaded?.(url)
          deleteUploadQueue(file)
        }
      })
    },
    [
      _uploadImage,
      addUploadQueue,
      deleteUploadQueue,
      addFailedFile,
      onImageUploaded
    ]
  )

  const onFileReceived = useCallback(
    (files: File[], editor?: CoreEditor) => {
      let largeFiles: string[] = []
      let imageCache = new Set()

      const SIZE_LIMIT = 5 // unit: MB
      files.forEach((file) => {
        if (file.size > 1024 * 1024 * SIZE_LIMIT)
          return largeFiles.push(
            `${file.name}: ${Math.round((file.size / 1024 / 1024) * 10) / 10}MB`
          )

        if (!editor) return uploadImage(file)

        const fileReader = new FileReader()
        const pos = editor.state.selection.anchor

        fileReader.readAsDataURL(file)
        fileReader.onload = () => {
          const preview = fileReader.result as string

          editor
            .chain()
            .insertContentAt(pos, {
              type: 'image',
              attrs: {
                src: preview
              }
            })
            .focus()
            .run()

          if (imageCache.has(preview)) return

          uploadImage(file)
            .then(({ data }) => {
              const { state } = editor
              const { doc } = state
              doc.descendants((node, pos) => {
                if (
                  node.type.name === 'image' &&
                  node.attrs.src === fileReader.result
                )
                  editor
                    .chain()
                    .setNodeSelection(pos)
                    .setImage({ src: data?.uploadImage.url as string })
                    .run()
              })
            })
            .catch((_) =>
              editor.chain().setNodeSelection(pos).deleteNode('image')
            )
        }
      })

      if (largeFiles.length)
        alert(
          `${SIZE_LIMIT}MB를 초과하는 다음 ${largeFiles.length}개 파일은 업로드되지 않습니다.\n` +
            largeFiles.join('\n')
        )
    },
    [uploadImage]
  )

  const retryUpload = useCallback(
    (file: File) => {
      deleteFailedFile(file)
      onFileReceived([file])
    },
    [deleteFailedFile, onFileReceived]
  )

  const extensions = useMemo(() => {
    let extensions: AnyExtension[] = [...commonExtensions]
    if (!editable) extensions.push(...viewerExtensions)
    else {
      extensions.push(...editorExtensions)
      extensions.push(
        FileHandler.configure({
          allowedMimeTypes: [
            'image/jpg',
            'image/jpeg',
            'image/png',
            'image/webp'
          ],
          onDrop: (editor, files) => onFileReceived(files, editor),
          onPaste: (editor, files, htmlContent) => {
            if (htmlContent) return
            onFileReceived(files, editor)
          }
        })
      )
    }

    return extensions
  }, [editable, onFileReceived])

  const debouncedClick = debounce(300, (e: MouseEvent<HTMLButtonElement>) => {
    if (e.detail >= 2) return onDoubleClickSaveStatus?.()
    else return onClickSaveStatus?.()
  })

  useEffect(() => {
    if (!editor) return

    if (editor.getHTML() !== content)
      setTimeout(() =>
        editor.commands.setContent(content, false, {
          preserveWhitespace: 'full'
        })
      )
  }, [editor, content])

  return (
    <div
      className={cn(className, 'Tiptap-wrapper', !editable && 'Tiptap-viewer')}
    >
      <EditorProvider
        extensions={extensions}
        parseOptions={{ preserveWhitespace: 'full' }}
        slotBefore={editable && <Toolbar className='rounded-t' />}
        slotAfter={
          editable && (
            <>
              <div className='mb-3 flex h-8 items-center rounded-b border border-neutral-100 bg-neutral-100 bg-opacity-50 px-1 py-0.5'>
                {status && (
                  <ThemedButton
                    className='px-1 py-0.5'
                    color={statusColors}
                    variant='text'
                    tooltip={
                      status === 'saved' ? '' : '임시 저장(더블클릭: 새로 저장)'
                    }
                    disabled={status === 'saving' || status === 'saved'}
                    tooltipOptions={{ placement: 'right' }}
                    onClick={debouncedClick}
                    onDoubleClick={debouncedClick}
                  >
                    <Icon
                      className='mr-1 inline-block'
                      size={0.75}
                      {...statusIconProps}
                    />
                    {statusTooltip}
                  </ThemedButton>
                )}
                <div className='grow' />
                <span className='text-right text-sm text-neutral-600'>
                  {`${editor?.storage.characterCount.words() || 0} 단어 (${editor?.storage.characterCount.characters() || 0} 자)`}
                </span>
              </div>
              <ImageCatalogue
                thumbnail={thumbnail}
                images={images}
                uploading={uploadQueue}
                failed={failedFiles}
                onFileReceived={onFileReceived}
                onImageImported={onImageImported}
                onImageDeleted={onImageDeleted}
                onAbortFile={deleteFailedFile}
                onRetryUpload={retryUpload}
                changeThumbnail={onChangeThumbnail}
              />
            </>
          )
        }
        autofocus={autofocus}
        onCreate={({ editor }) => {
          editor.commands.setContent(content, false)
          editor.setEditable(editable, false)
          editor.unregisterPlugin('history')
          editor.registerPlugin(history())
          setEditor(editor as ReactEditor)
        }}
        onUpdate={({ editor }) => {
          if (!initialized) return setInitialized(true)
          if (editor.getHTML() !== content) onChange?.(editor as ReactEditor)
        }}
      >
        {editable && (
          <BubbleMenu
            editor={null}
            tippyOptions={{ placement: 'bottom', maxWidth: '100%' }}
            shouldShow={({ editor }) => editor?.isActive('table')}
          >
            <TableTools />
          </BubbleMenu>
        )}
      </EditorProvider>
    </div>
  )
}
