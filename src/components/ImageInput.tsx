import { cloneElement, useCallback, useEffect, useRef, useState } from 'react'
import { Placement } from '@floating-ui/react'
import { useDiffState } from 'hooks/useDiffState'

import { cn } from 'utils/handleClassName'

import { mdiClose, mdiImage, mdiImageSearch, mdiRefresh } from '@mdi/js'
import { IconButton } from './Buttons/IconButton'
import { PopoverMenu } from './PopoverMenu'
import { PopoverMenuItem } from './PopoverMenu/PopoverMenuItem'

import type { ChangeEvent, FC, ReactElement } from 'react'

export const ImageInput: FC<{
  className?: string
  initialImage?: string
  menuPlacement?: Placement
  sizeLimit?: number
  onInput?: (file: File | null | undefined) => any
  Viewer?: ReactElement
}> = ({
  className,
  initialImage,
  menuPlacement = 'right-start',
  sizeLimit = 1,
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
    [setFile, onInput, sizeLimit]
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
        className='invisible absolute'
        accept='image/*'
        onChange={handleInput}
      />
      <PopoverMenu
        placement={menuPlacement}
        menuBtn={
          Viewer ? (
            cloneElement(Viewer, {
              ...Viewer.props,
              src: preview,
              style: {
                ...(Viewer.props?.style || {}),
                backgroundImage: preview ? `url(${preview})` : undefined
              }
            })
          ) : preview ? (
            <div
              className={cn('size-full bg-cover bg-center', className)}
              style={{ backgroundImage: `url(${preview})` }}
            />
          ) : (
            <IconButton path={mdiImage} variant='hover-text' />
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
