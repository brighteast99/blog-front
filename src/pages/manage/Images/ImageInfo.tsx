import clsx from 'clsx'
import { Link } from 'react-router-dom'

import { useReadQuery } from '@apollo/client'

import { useAppSelector } from 'store/hooks'
import { selectIsMobile } from 'store/slices/window/windowSlice'
import { getRelativeTimeFromNow } from 'utils/dayJS'

import { CopyButton } from 'components/Buttons/CopyButton'
import { ImagePreview } from 'components/ImagePreview'

import type { FC } from 'react'
import type { QueryRef } from '@apollo/client'
import type { ImageQueryResult, ImageQueryVariables } from 'api/media'
import type { fileSizeUnitLiteral } from 'types/commonProps'

export const ImageInfo: FC<{
  queryRef: QueryRef<ImageQueryResult, ImageQueryVariables>
  sizeUnit?: fileSizeUnitLiteral
}> = ({ queryRef, sizeUnit = 'MB' }) => {
  const isMobile = useAppSelector(selectIsMobile)
  const {
    data: {
      image: {
        url,
        name,
        size,
        width,
        height,
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

  return (
    <>
      <div
        className={clsx(
          'flex w-full justify-center gap-6',
          isMobile ? 'flex-row' : 'flex-col'
        )}
      >
        <ImagePreview
          className={clsx(isMobile ? 'w-64' : 'w-full')}
          image={url}
          scaleOnHover
        />
        <table
          className={clsx(
            'grow table-fixed',
            isMobile ? 'max-w-[50%]' : 'w-full grow'
          )}
        >
          <colgroup>
            <col width='35%' />
          </colgroup>
          <tbody className='*-[th]:text-nowrap *:py-2 *-[th]:text-left *-[th]:align-top'>
            <tr>
              <th>파일명</th>
              <td>
                <div className='flex size-full items-center gap-2'>
                  <span className='min-w-0 shrink truncate'>{name}</span>
                  <CopyButton
                    className='inline-block'
                    content={url}
                    size={0.6}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th>크기</th>
              <td>{`${size} ${sizeUnit}`}</td>
            </tr>
            <tr>
              <th>해상도</th>
              <td>{`${width} × ${height}`}</td>
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
                        <li key={`templte-${id}`}>
                          <Link
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
                        <li key={`templte-${id}`}>
                          <Link
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
      </div>
    </>
  )
}
