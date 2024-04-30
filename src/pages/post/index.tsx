import { FC } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TypedDocumentNode, gql, useQuery } from '@apollo/client'
import { Post } from 'types/data'
import { SuspendedText } from 'components/SuspendedText'
import { Error } from 'components/Error'
import { getRelativeTimeFromNow, isSameTime } from 'utils/dayJS'
import { Tiptap } from 'components/Tiptap'
import Icon from '@mdi/react'
import { mdiLock } from '@mdi/js'

const GET_POST: TypedDocumentNode<{ post: Post }, { id: number }> = gql`
  query PostMeta($id: Int!) {
    post(id: $id) {
      id
      title
      category {
        name
      }
      isHidden
      thumbnail
      createdAt
      updatedAt
      content
    }
  }
`

export const PostPage: FC = () => {
  const { postId } = useParams()
  const { data, loading, error, refetch } = useQuery(GET_POST, {
    variables: { id: Number(postId) },
    notifyOnNetworkStatusChange: true,
    skip: isNaN(Number(postId))
  })

  const isUpdated =
    !data?.post || !isSameTime(data.post.createdAt, data.post.updatedAt)

  if (error)
    return (
      <Error
        message='게시글 정보를 불러오지 못했습니다.'
        actions={[
          {
            label: '다시 시도',
            handler: () => refetch()
          }
        ]}
      />
    )

  if (!loading && !data?.post)
    return <Error code={404} message='존재하지 않는 게시글입니다.' />

  return (
    <div className='size-full overflow-y-auto'>
      <div
        className='h-56 border-b border-neutral-300 bg-neutral-500 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `url(${data?.post?.thumbnail})`
        }}
      >
        <div className='flex size-full flex-col items-center justify-center gap-1 py-5 backdrop-blur backdrop-brightness-50'>
          <Link to={`/category/${data?.post?.category?.id || 0}`}>
            <SuspendedText
              className='text-lg'
              loading={loading}
              text={data?.post?.category.name}
              align='center'
              length={6}
            />
          </Link>
          <div className='flex w-3/5 items-center justify-center'>
            {data?.post?.isHidden && (
              <Icon
                path={mdiLock}
                size={0.8}
                className='mr-1 mt-1.5 inline align-text-top text-neutral-700'
              />
            )}
            <SuspendedText
              className='text-4xl font-medium'
              loading={loading}
              text={data?.post?.title}
              align='center'
              length={100}
              lines={2}
            />
          </div>
          <SuspendedText
            className='font-thin'
            loading={loading}
            text={
              isUpdated
                ? `${getRelativeTimeFromNow(data?.post?.updatedAt || new Date())} (수정됨)`
                : getRelativeTimeFromNow(data?.post?.createdAt || new Date())
            }
            align='center'
            length={8}
          />
        </div>
      </div>
      <div className='mx-auto w-5/6 p-5'>
        {loading ? (
          <SuspendedText
            className='font-thin'
            loading={true}
            align='left'
            lines={5}
            length={100}
          />
        ) : (
          <Tiptap
            className='bg-transparent'
            editable={false}
            content={data?.post?.content}
          />
        )}
      </div>
    </div>
  )
}
