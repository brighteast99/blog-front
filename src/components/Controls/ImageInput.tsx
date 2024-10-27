import { cloneElement, useCallback, useEffect, useState } from 'react'
import { Placement } from '@floating-ui/react'
import clsx from 'clsx'

import { useDiffState } from 'hooks/useDiffState'
import { useDropzone } from 'hooks/useDropzone'
import { cn } from 'utils/handleClassName'

import { mdiClose, mdiImageSearch, mdiRefresh } from '@mdi/js'
import { PopoverMenu } from 'components/PopoverMenu'
import { PopoverMenuItem } from 'components/PopoverMenu/PopoverMenuItem'

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
  Viewer: _Viewer
}) => {
  const [file, setFile] = useState<File | null | undefined>()
  const {
    value: preview,
    setValue: setPreview,
    initialize: initializePreview,
    resetValue: resetPreview,
    hasChange
  } = useDiffState<string | undefined>(initialImage)
  const {
    inputRef: InputElement,
    dropzoneProps,
    isDragging
  } = useDropzone({ accept })

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

  const Viewer = (() => {
    const commonClassName = clsx(
      'relative border border-neutral-200 transition-border group-data-[state=open]/menu:border-primary overflow-hidden',
      isDragging && 'border-primary'
    )
    const dropzoneInfo = (
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
    )
    return _Viewer ? (
      cloneElement(_Viewer, {
        ..._Viewer.props,
        className: cn(commonClassName, _Viewer.props.className),
        src: preview,
        style: {
          ...(_Viewer.props?.style || {}),
          backgroundImage: `url(${preview})`
        },
        children: [...(_Viewer.props?.children || []), dropzoneInfo],
        ...dropzoneProps
      })
    ) : (
      <div
        className={clsx(
          commonClassName,
          'flex size-full items-center justify-center rounded-sm bg-neutral-50 bg-cover bg-center'
        )}
        style={{ backgroundImage: `url(${preview})` }}
        {...dropzoneProps}
      >
        {!preview && !isDragging && placeholder}
        {dropzoneInfo}
      </div>
    )
  })()

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
        menuBtn={Viewer}
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
