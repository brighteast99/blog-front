import { useCallback } from 'react'
import { Link } from 'react-router-dom'

import { useMutation, useReadQuery } from '@apollo/client'
import { DELETE_IMAGE, GET_IMAGES } from 'pages/manage/Images/api'

import { getRelativeTimeFromNow } from 'utils/dayJS'

import { CopyButton } from 'components/Buttons/CopyButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { ImagePreview } from 'components/ImagePreview'

import type { FC } from 'react'
import type { QueryRef } from '@apollo/client'
import type {
  ImageQueryResult,
  ImageQueryVariables
} from 'pages/manage/Images/api'

export const ImageInfo: FC<{
  queryRef: QueryRef<ImageQueryResult, ImageQueryVariables>
  onDelete?: (url: string) => any
}> = ({ queryRef, onDelete }) => {
  const {
    data: {
      image: {
        url,
        name,
        uploadedAt,
        thumbnailReferenceCount,
        templateThumbnailOf,
        draftThumbnailOf,
        postThumbnailOf,
        contentReferenceCount,
        templateContentOf,
        draftContentOf,
        postContentOf
      }
    }
  } = useReadQuery(queryRef)
  const [_deleteImage, { loading: deleting, reset: resetDeleteMutation }] =
    useMutation(DELETE_IMAGE, {
      notifyOnNetworkStatusChange: true
    })

  const deleteImage = useCallback(() => {
    if (!window.confirm(`이미지 '${name}'를 삭제합니다.`)) return

    _deleteImage({
      variables: {
        url: url
      },
      refetchQueries: [{ query: GET_IMAGES }],
      onCompleted: () => onDelete?.(url),
      onError: ({ networkError, graphQLErrors }) => {
        if (networkError) alert('이미지 삭제 중 오류가 발생했습니다.')
        else if (graphQLErrors.length) alert(graphQLErrors[0].message)
        resetDeleteMutation()
      }
    })
  }, [_deleteImage, onDelete, resetDeleteMutation, url, name])

  return (
    <div className='size-full px-4 py-6'>
      <ImagePreview className='mx-auto mb-6 w-5/6 max-w-64' image={url} />
      <table className='w-full table-fixed'>
        <colgroup>
          <col width='20%' />
        </colgroup>
        <tbody className='*:py-2 *-[th]:text-left *-[th]:align-top'>
          <tr>
            <th>파일명</th>
            <td>
              <div className='flex size-full items-center gap-2'>
                <span className='min-w-0 shrink truncate'>{name}</span>
                <CopyButton className='inline-block' content={url} size={0.6} />
              </div>
            </td>
          </tr>
          <tr>
            <th>업로드</th>
            <td>{getRelativeTimeFromNow(uploadedAt)}</td>
          </tr>
          <tr>
            <th>썸네일 사용</th>
            <td>
              {thumbnailReferenceCount === 0 ? (
                '없음'
              ) : (
                <details>
                  <summary>{thumbnailReferenceCount} 건</summary>
                  <ul className='ml-3 max-h-40 overflow-y-auto py-1'>
                    {templateThumbnailOf.map(({ id, title }) => (
                      <li>
                        <Link
                          key={`templte-${id}`}
                          to={`/manage/templates?template=${id}`}
                          className='block w-full truncate'
                        >
                          {`[템플릿] ${title}`}
                        </Link>
                      </li>
                    ))}
                    {draftThumbnailOf.map(({ id, summary }) => (
                      <li key={id} className='truncate'>
                        {`[임시 저장] ${summary}`}
                      </li>
                    ))}
                    {postThumbnailOf.map(({ id, title }) => (
                      <li>
                        <Link
                          key={`templte-${id}`}
                          to={`/post/${id}`}
                          className='block w-full truncate'
                        >
                          {title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </td>
          </tr>
          <tr>
            <th>본문 사용</th>
            <td>
              {contentReferenceCount === 0 ? (
                '없음'
              ) : (
                <details>
                  <summary>{contentReferenceCount} 건</summary>
                  <ul className='ml-3 max-h-40 overflow-y-auto py-1'>
                    {templateContentOf.map(({ id, title }) => (
                      <li key={`templte-${id}`}>
                        <Link
                          to={`/manage/templates?template=${id}`}
                          target='_blank'
                          className='block w-full truncate'
                        >
                          {`[템플릿] ${title}`}
                        </Link>
                      </li>
                    ))}
                    {draftContentOf.map(({ id, summary }) => (
                      <li key={`draft-${id}`} className='truncate'>
                        {`[임시 저장] ${summary}`}
                      </li>
                    ))}
                    {postContentOf.map(({ id, title }) => (
                      <li key={`post-${id}`}>
                        <Link
                          to={`/post/${id}`}
                          target='_blank'
                          className='block w-full truncate'
                        >
                          {title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <ThemedButton
        variant='text'
        color='error'
        className='absolute inset-x-0 bottom-0 h-10 w-full rounded-t-none'
        disabled={thumbnailReferenceCount + contentReferenceCount > 0}
        loading={deleting}
        onClick={deleteImage}
      >
        {thumbnailReferenceCount + contentReferenceCount > 0
          ? '삭제 불가'
          : '삭제'}
      </ThemedButton>
    </div>
  )
}
