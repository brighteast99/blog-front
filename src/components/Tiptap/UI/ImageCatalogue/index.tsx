import { useCallback, useRef } from 'react'
import { useCurrentEditor } from '@tiptap/react'

import { mdiPlus } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ImagePreview } from './ImagePreview'

import type { ChangeEvent, FC } from 'react'

export const ImageCatalogue: FC<{
  thumbnail?: string
  images?: string[]
  uploadQueue?: File[]
  onFileReceived?: (files: File[]) => any
  onImageDeleted?: (image: string) => any
  changeThumbnail?: (image: string | null) => any
}> = ({
  thumbnail,
  images = [],
  uploadQueue = [],
  onFileReceived,
  onImageDeleted,
  changeThumbnail
}) => {
  const { editor } = useCurrentEditor()
  const imageInput = useRef<HTMLInputElement>(null)

  const uploadImage = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return

      let files = Array.from(e.target.files)
      e.target.value = ''
      onFileReceived?.(files)
    },
    [onFileReceived]
  )

  const onInsertImage = useCallback(
    (image: string) =>
      editor
        ?.chain()
        .focus()
        .insertContentAt(editor.state.selection.anchor, {
          type: 'image',
          attrs: { src: image, alt: '' }
        })
        .run(),
    [editor]
  )

  const onDeleteImage = useCallback(
    (url: string) => {
      onImageDeleted?.(url)

      if (!editor) return

      const { state } = editor
      const { doc } = state

      const nodesToRemove: { pos: number; size: number }[] = []

      doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === url)
          nodesToRemove.push({ pos, size: node.nodeSize })
      })

      if (nodesToRemove.length) {
        let transaction = editor.state.tr
        for (const { pos, size } of nodesToRemove.toReversed())
          transaction = transaction.delete(pos, pos + size)
        editor.view.dispatch(transaction)
      }
    },
    [onImageDeleted, editor]
  )

  return (
    <div className='mt-2'>
      <input
        ref={imageInput}
        className='invisible absolute'
        type='file'
        accept='image/*'
        multiple
        onChange={uploadImage}
      />
      <div className='mb-1 flex items-center justify-between'>
        <span>첨부 이미지</span>
        <IconButton
          className='block'
          path=''
          variant='hover-text'
          iconProps={{ path: mdiPlus }}
          onClick={imageInput.current?.click}
        />
      </div>
      <div className='min-h-40 resize-y overflow-y-auto rounded border border-neutral-100 bg-neutral-50 p-1 focus-within:border-primary'>
        <div
          className='grid gap-3'
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 150px))'
          }}
        >
          {images.map((image, i) => (
            <ImagePreview
              key={i}
              isThumbnail={thumbnail === image}
              image={image}
              onSelect={onInsertImage}
              onDelete={onDeleteImage}
              onChangeThumbnail={changeThumbnail}
            />
          ))}
          {uploadQueue.map((file, i) => (
            <ImagePreview key={i} image={file} />
          ))}
        </div>
      </div>
    </div>
  )
}
