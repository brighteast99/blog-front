import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from 'react'
import { Editor as CoreEditor } from '@tiptap/core'
import {
  BubbleMenu,
  EditorProvider,
  Editor as ReactEditor
} from '@tiptap/react'

import { cn } from 'utils/handleClassName'

import { commonExtensions, editorExtensions, viewerExtensions } from './editor'
import { ImageCatalogue } from './UI/ImageCatalogue'
import { Toolbar } from './UI/Toolbar'

import type { FC } from 'react'

import './Tiptap.scss'

import FileHandler from '@tiptap-pro/extension-file-handler'

import { useMutation } from '@apollo/client'
import { UPLOAD_IMAGE } from './api'

import { TableTools } from './UI/TableTools'

interface EditorProps {
  className?: string
  content?: string
  thumbnail?: string
  images?: string[]
  editable?: boolean
  autofocus?: boolean
  onChange?: (editor: ReactEditor) => any
  onImageUploaded?: (image: string) => any
  onImageImported?: (images: string[]) => any
  onImageDeleted?: (image: string) => any
  onChangeThumbnail?: (image: string | null) => any
}

export const Tiptap: FC<EditorProps> = ({
  className,
  content = '<p></p>',
  thumbnail,
  images = [],
  editable = true,
  autofocus = false,
  onChange,
  onImageUploaded,
  onImageImported,
  onImageDeleted,
  onChangeThumbnail
}) => {
  const [editor, setEditor] = useState<ReactEditor>()
  const [uploadQueue, setUploadQueue] = useState<File[]>([])
  const [_uploadImage] = useMutation(UPLOAD_IMAGE)

  const uploadImage = useCallback(
    (file: File) => {
      setUploadQueue((prev) => [...prev, file])
      return _uploadImage({
        variables: { file },
        onError: ({ networkError, graphQLErrors }) => {
          if (networkError)
            return alert(`${file.name}을 업로드하던 중 오류가 발생했습니다`)
          if (graphQLErrors.length) return alert(graphQLErrors[0].message)
        },
        onCompleted: ({ uploadImage: { url } }) => {
          onImageUploaded?.(url)
          setUploadQueue((prev) =>
            prev.toSpliced(
              prev.findIndex((item) => item === file),
              1
            )
          )
        }
      })
    },
    [_uploadImage, setUploadQueue, onImageUploaded]
  )

  const onFileReceived = useCallback(
    (files: File[], editor?: CoreEditor) => {
      let largeFiles: string[] = []
      let imageCache = new Set()

      const SIZE_LIMIT = 5 // MB
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

  const extensions = useMemo(() => {
    let extensions = [...commonExtensions]
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

  useLayoutEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

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
            <div className='contents'>
              <div className='rounded-b border border-neutral-100 bg-neutral-100 bg-opacity-50 px-1 py-0.5'>
                <p className='text-right text-sm text-neutral-600'>
                  {`${editor?.storage.characterCount.words() || 0} 단어 (${editor?.storage.characterCount.characters() || 0} 자)`}
                </p>
              </div>
              <ImageCatalogue
                thumbnail={thumbnail}
                images={images}
                uploadQueue={uploadQueue}
                onFileReceived={onFileReceived}
                onImageImported={onImageImported}
                onImageDeleted={onImageDeleted}
                changeThumbnail={onChangeThumbnail}
              />
            </div>
          )
        }
        autofocus={autofocus}
        onCreate={({ editor }) => {
          editor.commands.setContent(content)
          setEditor(editor as ReactEditor)
        }}
        onUpdate={({ editor }) => {
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
