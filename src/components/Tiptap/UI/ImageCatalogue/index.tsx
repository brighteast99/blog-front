import { useCallback, useRef } from 'react'
import { FloatingDelayGroup } from '@floating-ui/react'
import { useCurrentEditor } from '@tiptap/react'
import clsx from 'clsx'

import { mdiPlus } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ImageImporter } from 'components/Tiptap/UI/ImageCatalogue/ImageImporter'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'
import { ImagePreview } from './ImagePreview'

import type { ChangeEvent, FC } from 'react'

export const ImageCatalogue: FC<{
  thumbnail?: string
  images?: string[]
  uploadQueue?: File[]
  onFileReceived?: (files: File[]) => any
  onImageImported?: (images: string[]) => any
  onImageDeleted?: (image: string) => any
  changeThumbnail?: (image: string | null) => any
}> = ({
  thumbnail,
  images = [],
  uploadQueue = [],
  onFileReceived,
  onImageImported,
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
    <div className='mt-3'>
      <input
        ref={imageInput}
        type='file'
        hidden
        accept='image/*'
        multiple
        onChange={uploadImage}
      />
      <div className='mb-1 flex items-center gap-0.5'>
        <span>첨부 이미지</span>
        <div className='min-w-0 grow' />
        <FloatingDelayGroup delay={100}>
          <ImageImporter
            className='block'
            exclude={images}
            description='서버 이미지 탐색'
            onClickImport={onImageImported}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton
                className='block'
                path={mdiPlus}
                variant='hover-text'
                onClick={() => imageInput.current?.click()}
              />
            </TooltipTrigger>
            <TooltipContent>이미지 업로드</TooltipContent>
          </Tooltip>
        </FloatingDelayGroup>
      </div>

      <div
        className={clsx(
          'relative resize-y overflow-y-auto rounded border border-neutral-100 bg-neutral-50 p-1 focus-within:border-primary',
          images.length ? 'min-h-40' : 'min-h-20'
        )}
      >
        {images.length === 0 && (
          <span className='absolute inset-0 m-auto size-fit text-lg font-semibold text-foreground text-opacity-10'>
            이미지 없음
          </span>
        )}
        <div
          className='grid gap-4 p-3'
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
