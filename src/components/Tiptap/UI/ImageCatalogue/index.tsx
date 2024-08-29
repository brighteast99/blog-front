import { useCallback, useLayoutEffect } from 'react'
import { FloatingDelayGroup } from '@floating-ui/react'
import { useCurrentEditor } from '@tiptap/react'
import clsx from 'clsx'

import { useDropzone } from 'hooks/useDropzone'
import { formatDate } from 'utils/dayJS'

import Icon from '@mdi/react'
import {
  mdiAlertOutline,
  mdiClose,
  mdiImage,
  mdiImageOff,
  mdiImagePlus,
  mdiImageRemove,
  mdiPlus,
  mdiRefresh
} from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ImagePreview } from 'components/ImagePreview'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from 'components/utils/Tooltip'
import { ImageFilePreview } from './ImageFilePreview'
import { ImageImporter } from './ImageImporter'

import type { ChangeEvent, FC } from 'react'

interface ImageCatalogueProps {
  className?: string
  thumbnail?: string
  images?: string[]
  uploading?: Set<File>
  failed?: Set<File>
  onFileReceived?: (files: File[]) => any
  onImageImported?: (images: string[]) => any
  onImageDeleted?: (image: string) => any
  onAbortFile?: (file: File) => any
  onRetryUpload?: (file: File) => any
  changeThumbnail?: (image: string | null) => any
}

export const ImageCatalogue: FC<ImageCatalogueProps> = ({
  className,
  thumbnail,
  images = [],
  uploading = new Set<File>([]),
  failed = new Set<File>([]),
  onFileReceived,
  onImageImported,
  onImageDeleted,
  onAbortFile,
  onRetryUpload,
  changeThumbnail
}) => {
  const { editor } = useCurrentEditor()
  const {
    isDragging,
    dropzoneProps,
    inputRef: imageInput
  } = useDropzone({ accept: 'image/*' })

  const uploadImage = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return

      let files = Array.from(e.target.files)
      e.target.value = ''
      onFileReceived?.(files)
    },
    [onFileReceived]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (!imageInput.current || document.activeElement !== imageInput.current)
        return

      if (!e.clipboardData?.items) return

      const items = e.clipboardData.items
      const dataTransfer = new DataTransfer()

      let counter = 0
      for (const item of items)
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          let file = item.getAsFile()
          if (!file) continue

          // * rename if image file doesn't have name
          if (file.name.split('.')[0] === 'image')
            file = new File(
              [file],
              `clipboard_image_${formatDate('YYMMDD_HHmmss')} ${counter ? `(${counter++ + 1})` : ''}`,
              { type: file.type }
            )

          dataTransfer.items.add(file)
        }

      imageInput.current.files = dataTransfer.files
      imageInput.current.dispatchEvent(new Event('change', { bubbles: true }))
    },
    [imageInput]
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

  useLayoutEffect(() => {
    window.addEventListener('paste', handlePaste)

    return () => window.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  return (
    <div className={className}>
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
          'relative overflow-y-auto rounded border border-neutral-100 bg-neutral-50 p-1 transition-[border-color,min-height] focus-within:border-primary',
          images.length && 'resize-y',
          images.length > 0 || isDragging ? 'min-h-40' : 'min-h-10',
          isDragging && 'border-primary'
        )}
        {...dropzoneProps}
        onClick={() => imageInput.current?.focus()}
      >
        <input
          ref={imageInput}
          type='file'
          className='absolute size-0 opacity-0'
          accept='image/*'
          multiple
          onChange={uploadImage}
        />

        {images.length === 0 && !isDragging && (
          <span className='absolute inset-0 m-auto size-fit text-lg font-semibold text-foreground text-opacity-10'>
            이미지 없음
          </span>
        )}

        {images.length + uploading.size + failed.size > 0 && (
          <div
            className='grid gap-4 p-3'
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
              gridTemplateRows: 'auto'
            }}
          >
            {images.map((image, i) => {
              const isThumbnail = thumbnail === image
              return (
                <ImagePreview key={i} active={isThumbnail} image={image}>
                  <div className='absolute size-full bg-neutral-50 bg-opacity-75 opacity-0 transition-opacity hover:opacity-100'>
                    <div className='absolute inset-0 m-auto flex size-fit gap-1'>
                      <FloatingDelayGroup delay={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              className='p-1'
                              path={mdiImagePlus}
                              color='primary'
                              variant='hover-text'
                              size={1.2}
                              onClick={() => onInsertImage(image)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>본문에 삽입</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              className='p-1'
                              path={isThumbnail ? mdiImageOff : mdiImage}
                              color={isThumbnail ? 'error' : 'primary'}
                              variant={isThumbnail ? 'text' : 'hover-text'}
                              size={1.2}
                              onClick={() =>
                                changeThumbnail?.(isThumbnail ? null : image)
                              }
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            {isThumbnail
                              ? '대표 이미지 해제'
                              : '대표 이미지 설정'}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconButton
                              path={mdiImageRemove}
                              color='error'
                              variant='text'
                              size={1.2}
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    `${isThumbnail ? '대표 이미지가 해제되며 ' : ''}본문에 포함된 이미지도 모두 제거됩니다.`
                                  )
                                )
                                  return
                                onDeleteImage(image)
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>이미지 삭제</TooltipContent>
                        </Tooltip>
                      </FloatingDelayGroup>
                    </div>
                  </div>
                  <div
                    className={clsx(
                      'absolute size-fit bg-primary px-1.5 text-background transition-opacity',
                      !isThumbnail && 'opacity-0'
                    )}
                  >
                    대표
                  </div>
                </ImagePreview>
              )
            })}

            {[...uploading].map((file, i) => (
              <ImageFilePreview
                key={i}
                image={file}
                className='relative'
                loading
              />
            ))}

            {[...failed].map((file, i) => (
              <ImageFilePreview key={i} image={file}>
                <span className='absolute bottom-1 left-1 text-xs text-error'>
                  <Icon
                    className='-mt-0.5 mr-0.5 inline'
                    path={mdiAlertOutline}
                    size={0.8}
                  />
                  업로드 실패
                </span>
                <div className='absolute size-full bg-neutral-50 bg-opacity-75 opacity-0 transition-opacity hover:opacity-100'>
                  <div className='absolute inset-0 m-auto flex size-fit gap-2'>
                    <FloatingDelayGroup delay={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconButton
                            path={mdiRefresh}
                            variant='hover-text'
                            color='primary'
                            size={1.2}
                            onClick={() => onRetryUpload?.(file)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>다시 시도</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconButton
                            path={mdiClose}
                            variant='text'
                            color='error'
                            size={1.2}
                            onClick={() => onAbortFile?.(file)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>업로드 취소</TooltipContent>
                      </Tooltip>
                    </FloatingDelayGroup>
                  </div>
                </div>
              </ImageFilePreview>
            ))}
          </div>
        )}
        <div
          className={clsx(
            'absolute inset-0 flex size-full items-center justify-center bg-primary bg-opacity-10 transition-opacity',
            !isDragging && 'pointer-events-none opacity-0'
          )}
        >
          <span className='text-lg font-semibold text-foreground'>
            여기에 드롭
          </span>
        </div>
      </div>
    </div>
  )
}
