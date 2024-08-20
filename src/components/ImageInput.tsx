import { cloneElement, useCallback, useEffect, useRef, useState } from 'react'
import { Placement } from '@floating-ui/react'

import { useDiffState } from 'hooks/useDiffState'
import { cn } from 'utils/handleClassName'

import { mdiClose, mdiImageSearch, mdiRefresh } from '@mdi/js'
import { PopoverMenu } from './PopoverMenu'
import { PopoverMenuItem } from './PopoverMenu/PopoverMenuItem'

import type { ChangeEvent, FC, ReactElement } from 'react'

export const ImageInput: FC<{
  className?: string
  initialImage?: string
  accept?: string
  menuPlacement?: Placement
  sizeLimit?: number
  placeholder?: ReactElement
  onInput?: (file: File | null | undefined) => any
  Viewer?: ReactElement
}> = ({
  className,
  initialImage,
  accept = 'image/*',
  sizeLimit = 1,
  placeholder,
  menuPlacement = 'right-start',
  onInput,
  Viewer
}) => {
  const InputElement = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null | undefined>()
  const {
    value: preview,
    setValue: setPreview,
    initialize: initializePreview,
    resetValue: resetPreview,
    hasChange
  } = useDiffState<string | undefined>(initialImage)

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 1024 * 1024 * sizeLimit)
        return alert(
          `파일 크기는 ${sizeLimit}MB를 넘을 수 없습니다.\n선택한 파일 크기: ${Math.round((file.size / 1024 / 1024) * 10) / 10}MB`
        )

      onInput?.(file)
      setFile(file)
    },
    [onInput, sizeLimit]
  )

  useEffect(() => {
    if (file === undefined) {
      resetPreview()
      return
    }

    if (file === null) {
      setPreview(undefined)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file, setPreview, resetPreview])

  useEffect(() => {
    initializePreview(initialImage)
    setFile(undefined)
  }, [initialImage, initializePreview, setFile])

  return (
    <>
      <input
        ref={InputElement}
        type='file'
        accept={accept}
        hidden
        onChange={handleInput}
      />
      <PopoverMenu
        className={cn('size-fit', className)}
        placement={menuPlacement}
        menuBtn={
          Viewer ? (
            cloneElement(Viewer, {
              ...Viewer.props,
              src: preview,
              style: {
                ...(Viewer.props?.style || {}),
                backgroundImage: `url(${preview})`
              }
            })
          ) : (
            <div
              className='flex size-full items-center justify-center rounded-sm border border-neutral-200 bg-neutral-50 bg-cover bg-center transition-border group-data-[state=open]/menu:border-primary'
              style={{ backgroundImage: `url(${preview})` }}
            >
              {!preview && placeholder}
            </div>
          )
        }
      >
        <PopoverMenuItem
          title='이미지 선택'
          icon={mdiImageSearch}
          onClick={() => InputElement.current?.click()}
        />
        {(preview || hasChange) && (
          <PopoverMenuItem
            className={hasChange ? 'text-unset' : 'text-error'}
            title={hasChange ? '되돌리기' : '기본 이미지로 변경'}
            icon={hasChange ? mdiRefresh : mdiClose}
            onClick={() => {
              const value = hasChange ? undefined : null
              setFile(value)
              onInput?.(value)
              if (InputElement.current) InputElement.current.value = ''
            }}
          />
        )}
      </PopoverMenu>
    </>
  )
}
