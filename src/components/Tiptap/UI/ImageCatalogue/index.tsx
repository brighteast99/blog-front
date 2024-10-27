import { useCallback, useEffect } from 'react'
import { FloatingDelayGroup } from '@floating-ui/react'
import { useCurrentEditor } from '@tiptap/react'
import clsx from 'clsx'

import { useDialog } from 'hooks/useDialog'
import { useDropzone } from 'hooks/useDropzone'
import { formatDate } from 'utils/dayJS'

import Icon from '@mdi/react'
import {
  mdiAlertOutline,
  mdiClose,
  mdiImage,
  mdiImageMinus,
  mdiImageOff,
  mdiImagePlus,
  mdiImageRemove,
  mdiPlus,
  mdiRefresh
} from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ImagePreview } from 'components/ImagePreview'
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
  const showDialog = useDialog()

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
    async (
      url: string,
      options?: { isThumbnail?: boolean; force?: boolean }
    ) => {
      if (
        !options?.force &&
        !(await showDialog(
          `${options?.isThumbnail ? '대표 이미지가 해제되며\n' : ''}본문에 포함된 이미지도 모두 제거됩니다.`,
          'NEGATIVECONFIRM'
        ))
      )
        return

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
    [onImageDeleted, editor, showDialog]
  )

  const pruneImages = useCallback(async () => {
    if (
      !(await showDialog(
        '사용되지 않은 이미지를 모두 제거합니다.\n서버에서는 삭제되지 않습니다.',
        'NEGATIVECONFIRM'
      ))
    )
      return

    const imagesUsed = new Set<string>()

    if (!editor) return

    const { state } = editor
    const { doc } = state

    if (thumbnail) imagesUsed.add(thumbnail)
    doc.descendants((node) => {
      if (node.type.name === 'image') imagesUsed.add(node.attrs.src)
    })

    const imagesToDelete = images.filter((image) => !imagesUsed.has(image))
    if (!imagesToDelete.length) return showDialog('제거할 이미지가 없습니다')

    for (const image of imagesToDelete) onDeleteImage(image, { force: true })
  }, [editor, images, thumbnail, onDeleteImage, showDialog])

  useEffect(() => {
    window.addEventListener('paste', handlePaste)

    return () => window.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  return (
    <div className={className}>
      <div className='mb-1 flex items-center gap-0.5'>
        <span>첨부 이미지</span>
        <div className='min-w-0 grow' />
        <FloatingDelayGroup delay={100}>
          <IconButton
            className='block'
            path={mdiImageMinus}
            variant='hover-text'
            color='error'
            disabled={!images.length}
            tooltip='미사용 이미지 제거'
            onClick={pruneImages}
          />
          <ImageImporter
            className='block'
            exclude={images}
            description='이미지 가져오기'
            onClickImport={onImageImported}
          />
          <IconButton
            className='block'
            path={mdiPlus}
            variant='hover-text'
            tooltip='이미지 업로드'
            onClick={() => imageInput.current?.click()}
          />
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
                        <IconButton
                          className='p-1'
                          path={mdiImagePlus}
                          color='primary'
                          variant='hover-text'
                          size={1.2}
                          tooltip='본문에 삽입'
                          onClick={() => onInsertImage(image)}
                        />
                        <IconButton
                          className='p-1'
                          path={isThumbnail ? mdiImageOff : mdiImage}
                          color={isThumbnail ? 'error' : 'primary'}
                          variant={isThumbnail ? 'text' : 'hover-text'}
                          size={1.2}
                          tooltip={
                            isThumbnail
                              ? '대표 이미지 해제'
                              : '대표 이미지 설정'
                          }
                          onClick={() =>
                            changeThumbnail?.(isThumbnail ? null : image)
                          }
                        />
                        <IconButton
                          path={mdiImageRemove}
                          color='error'
                          variant='text'
                          size={1.2}
                          tooltip='이미지 삭제'
                          onClick={() => onDeleteImage(image, { isThumbnail })}
                        />
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
                      <IconButton
                        path={mdiRefresh}
                        variant='hover-text'
                        color='primary'
                        size={1.2}
                        tooltip='다시 시도'
                        onClick={() => onRetryUpload?.(file)}
                      />
                      <IconButton
                        path={mdiClose}
                        variant='text'
                        color='error'
                        size={1.2}
                        tooltip='업로드 취소'
                        onClick={() => onAbortFile?.(file)}
                      />
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
