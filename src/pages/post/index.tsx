import { FC } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import { Post } from 'types/data'
import { SuspendedText } from 'components/SuspendedText'
import { Error404 } from 'pages/errors/404'
import { getRelativeTimeFromNow } from 'utils/timeFormatter'

const GET_POST = gql`
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
  const { loading, data } = useQuery<{
    post?: Post
  }>(GET_POST, {
    variables: { id: Number(postId) }
  })

  const isUpdated = data?.post?.createdAt !== data?.post?.updatedAt

  if (!loading && !data?.post)
    return <Error404 message='존재하지 않는 게시글입니다.' />

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
          <SuspendedText
            className='w-3/5 text-4xl font-medium'
            loading={loading}
            text={data?.post?.title}
            align='center'
            length={100}
            lines={2}
          />
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
      <div className='mx-auto w-5/6 p-5'>{data?.post?.content}</div>
    </div>
  )
}
