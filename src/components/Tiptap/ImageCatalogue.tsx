import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { useCurrentEditor } from '@tiptap/react'
import { IconButton } from 'components/Buttons/IconButton'
import { mdiClose, mdiPlus } from '@mdi/js'
import { TypedDocumentNode, gql, useMutation } from '@apollo/client'
import { Spinner } from 'components/Spinner'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import clsx from 'clsx'

const UPLOAD_IMAGE: TypedDocumentNode<
  { uploadImage: { url: string } },
  { file: File }
> = gql`
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file) {
      url
    }
  }
`

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
  addImage?: (image: string) => any
  deleteImage?: (image: string) => any
  changeThumbnail?: (image: string | null) => any
}> = ({ thumbnail, images = [], addImage, deleteImage, changeThumbnail }) => {
  const { editor } = useCurrentEditor()
  const imageInput = useRef<HTMLInputElement>(null)
  const [_uploadImage] = useMutation(UPLOAD_IMAGE)
  const [files, setFiles] = useState<File[]>([])

  const uploadImage = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return

      let files = Array.from(e.target.files)
      e.target.value = ''
      let largeFiles: string[] = []

      files.forEach((file, i) => {
        const fileName =
          file.name.length < 20 ? file.name : file.name.slice(0, 20) + '...'

        if (file.size > 1024 * 1024 * 3) {
          files.splice(i, 1)
          largeFiles.push(
            `${fileName}: ${Math.round((file.size / 1024 / 1024) * 10) / 10}MB`
          )
          return
        }

        setFiles((prev) => [...prev, file])
        _uploadImage({
          variables: { file: file },
          onError: ({ networkError, graphQLErrors }) => {
            if (networkError)
              return alert(`${fileName}을 업로드하던 중 오류가 발생했습니다`)
            if (graphQLErrors.length) return alert(graphQLErrors[0].message)
          },
          onCompleted: ({ uploadImage: { url } }) => {
            addImage?.(url)
            setFiles((prev) => {
              let idx = prev.findIndex((item) => item === file)
              return prev.toSpliced(idx, 1)
            })
          }
        })
      })

      if (largeFiles.length) {
        let message = `3MB를 초과하는 다음 ${largeFiles.length}개 파일은 업로드되지 않습니다.\n`
        alert(message + largeFiles.join('\n'))
      }
    },
    [_uploadImage, addImage]
  )

  const useImage = useCallback(
    (image: string) => {
      editor?.chain().focus().setImage({ src: image, alt: '' }).run()
    },
    [editor]
  )

  const deleteImageFromServer = useCallback(
    (url: string) => {
      deleteImage?.(url)

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
    [deleteImage, editor]
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
          {[...images, ...files].map((image, i) => (
            <ImagePreview
              key={i}
              isThumbnail={thumbnail === image}
              image={image}
              onSelect={useImage}
              onDelete={deleteImageFromServer}
              onChangeThumbnail={changeThumbnail}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
