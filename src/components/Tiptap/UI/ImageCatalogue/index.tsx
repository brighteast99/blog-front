import { useCallback, useEffect, useRef, useState } from 'react'
import { useCurrentEditor } from '@tiptap/react'
import clsx from 'clsx'

import { mdiClose, mdiPlus } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Spinner } from 'components/Spinner'

import type { ChangeEvent, FC } from 'react'

const ImagePreview: FC<{
  isThumbnail?: boolean
  image: File | string
  onDelete?: (image: string) => any
  onSelect?: (image: string) => any
  onChangeThumbnail?: (image: string | null) => any
}> = ({
  isThumbnail = false,
  image,
  onDelete,
  onSelect,
  onChangeThumbnail
}) => {
  let [src, setSrc] = useState<string>()

  useEffect(() => {
    if (typeof image === 'string') setSrc(image)
    else {
      const url = URL.createObjectURL(image)
      setSrc(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [image])

  return (
    <div
      className={clsx(
        'relative aspect-square border',
        isThumbnail ? 'border-2 border-primary' : 'border-neutral-400'
      )}
    >
      {isThumbnail && (
        <div className='absolute size-fit bg-primary px-1 py-0.5 text-background'>
          대표
        </div>
      )}
      {image instanceof File ? (
        <div className='absolute size-full bg-neutral-50 bg-opacity-50'>
          <Spinner className='absolute inset-0' />
        </div>
      ) : (
        <div className='absolute size-full bg-neutral-50 bg-opacity-75 opacity-0 transition-opacity hover:opacity-100'>
          <IconButton
            className='absolute right-0 top-0'
            path={mdiClose}
            variant='hover-text'
            color='error'
            onClick={() => {
              if (
                !window.confirm(
                  `${isThumbnail ? '대표 이미지가 해제되며 ' : ''}본문에 포함된 이미지도 모두 제거됩니다.`
                )
              )
                return
              onDelete?.(image)
            }}
          />
          <div className='absolute inset-0 m-auto flex size-fit flex-col items-center justify-center gap-2'>
            <ThemedButton
              className='p-1'
              color='primary'
              onClick={() => onSelect?.(image)}
            >
              본문에 삽입
            </ThemedButton>
            <ThemedButton
              className='p-1'
              color={isThumbnail ? 'error' : 'primary'}
              variant={isThumbnail ? 'text' : 'flat'}
              onClick={() => onChangeThumbnail?.(isThumbnail ? null : image)}
            >
              {isThumbnail ? '대표 이미지 해제' : '대표 이미지 설정'}
            </ThemedButton>
          </div>
        </div>
      )}
      <img className='block size-full object-contain' src={src} alt='' />
    </div>
  )
}

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
    (image: string) => {
      editor
        ?.chain()
        .focus()
        .insertContentAt(editor.state.selection.anchor, {
          type: 'image',
          attrs: {
            src: image,
            alt: ''
          }
        })
        .run()
    },
    [editor]
  )

  const onDeleteImage = useCallback(
    (url: string) => {
      onImageDeleted?.(url)

      if (editor) {
        const { state } = editor
        const { doc } = state

        const nodesToRemove: { pos: number; size: number }[] = []

        doc.descendants((node, pos) => {
          if (node.type.name === 'image' && node.attrs.src === url)
            nodesToRemove.push({ pos, size: node.nodeSize })
        })

        if (nodesToRemove.length) {
          let transaction = editor.state.tr
          for (let i = nodesToRemove.length - 1; i >= 0; i--) {
            const { pos, size } = nodesToRemove[i]
            transaction = transaction.delete(pos, pos + size)
          }
          editor.view.dispatch(transaction)
        }
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
          onClick={() => imageInput.current?.click()}
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
