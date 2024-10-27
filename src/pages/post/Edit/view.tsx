import { mdiLock, mdiLockOpen } from '@mdi/js'
import { IconButton } from 'components/Buttons/IconButton'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Combobox } from 'components/Combobox'
import { Spinner } from 'components/Spinner'
import { Tiptap } from 'components/Tiptap'
import { NavigationBlocker } from 'components/utils/NavigationBlocker'
import { DraftManager } from './DraftManager'
import { TemplateSelector } from './TemplateSelector'

import type { FC } from 'react'
import type { PostInput } from 'api/post'
import type { SaveStatus } from 'components/Tiptap'
import type { Category, Draft, Template } from 'types/data'

interface EditPostPageViewProps {
  newPost?: boolean
  draftId?: number
  categories?: Category[]
  selectedCategory?: Category
  loadingCategories: boolean
  errorLoadingCategories: boolean
  refetchCategories: () => any
  importDraft: (draft: Draft) => any
  onDraftDeleted: (id: number) => any
  importTemplate: (draft: Template) => any
  loadingPost: boolean
  inputs: PostInput
  status?: SaveStatus
  setTitle: (title: string) => any
  setCategory: (category?: number) => any
  setIsHidden: (isHidden: boolean) => any
  setContent: (content: string) => any
  setTextContent: (textContent: string) => any
  setThumbnail: (thumbnail: string | null) => any
  addImage: (image: string) => any
  addImages: (images: string[]) => any
  removeImage: (image: string) => any
  setTags: (tags: string[]) => any
  hasChange: boolean
  hashtags: string[]
  loadingHashtags: boolean
  searchHashtags: (keyword: string) => any
  submitting: boolean
  submit: () => any
  save: (asNew?: boolean) => any
}

export const EditPostPageView: FC<EditPostPageViewProps> = ({
  newPost = false,
  draftId,
  categories,
  selectedCategory,
  loadingCategories,
  errorLoadingCategories,
  refetchCategories,
  importDraft,
  onDraftDeleted,
  importTemplate,
  loadingPost,
  inputs,
  status,
  setTitle,
  setCategory,
  setIsHidden,
  setContent,
  setTextContent,
  setThumbnail,
  addImage,
  addImages,
  removeImage,
  setTags,
  hasChange,
  hashtags,
  loadingHashtags,
  searchHashtags,
  submitting,
  submit,
  save
}) => {
  const { title, category, isHidden, content, images, thumbnail, tags } = inputs

  return (
    <>
      {loadingPost && (
        <div className='absolute inset-0 z-10 flex size-full items-center justify-center bg-neutral-50 bg-opacity-75'>
          <Spinner />
        </div>
      )}

      <NavigationBlocker
        enabled={hasChange && !submitting}
        message={`${newPost ? '작성' : '수정'}중인 내용이 있습니다.\n페이지를 벗어나시겠습니까?`}
      />

      <div className='mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col p-10'>
        <div className='mb-3 flex w-full items-center justify-between gap-2'>
          <DraftManager
            activeDraft={draftId}
            onSelect={importDraft}
            onDelete={onDraftDeleted}
          />
          <TemplateSelector onSelect={importTemplate} />
        </div>

        <div className='mb-3 flex w-full gap-2'>
          <select
            className='grow py-1'
            disabled={loadingCategories || Boolean(errorLoadingCategories)}
            value={category}
            onChange={(e) => setCategory(Number(e.target.value) || undefined)}
          >
            <option value={0}>
              {errorLoadingCategories ? '게시판 정보 로드 실패' : '분류 미지정'}
            </option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.level > 0 &&
                  '└' + '─'.repeat(category.level - 1) + ' '}
                {category.name}
                {category.isHidden && ' (비공개)'}
              </option>
            ))}
          </select>
          {errorLoadingCategories && (
            <ThemedButton
              className='h-8 px-2'
              variant='flat'
              loading={loadingCategories}
              spinnerSize='xs'
              onClick={() => refetchCategories()}
              color='primary'
            >
              다시 시도
            </ThemedButton>
          )}
        </div>

        <div className='mb-3 flex w-full flex-wrap items-center gap-2'>
          <input
            className='min-w-0 grow text-2xl'
            type='text'
            placeholder='게시글 제목'
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={(e) => setTitle(e.target.value.trim())}
            required
          />
          <IconButton
            path={isHidden ? mdiLock : mdiLockOpen}
            variant='hover-text-toggle'
            color='primary'
            disabled={selectedCategory?.isHidden}
            tooltip={
              selectedCategory?.isHidden
                ? '비공개 분류에 속하는 게시글입니다'
                : (isHidden ? '공개 게시글' : '비공개 게시글') + '로 전환'
            }
            active={isHidden}
            onClick={() => setIsHidden(!isHidden)}
          />
        </div>

        {!loadingPost && (
          <Tiptap
            className='mb-2 min-h-40 grow'
            content={content}
            status={status}
            thumbnail={thumbnail}
            images={images}
            onChange={(editor) => {
              setContent(editor.getHTML())
              setTextContent(editor.getText())
            }}
            onImageUploaded={addImage}
            onImageImported={addImages}
            onImageDeleted={removeImage}
            onChangeThumbnail={setThumbnail}
            onClickSaveStatus={save}
            onDoubleClickSaveStatus={() => save(true)}
          />
        )}

        <Combobox
          className='mb-5 max-h-16'
          name='태그'
          value={tags}
          placeholder='태그 선택'
          allowNewValue
          items={hashtags}
          loading={loadingHashtags}
          onChange={setTags}
          onInputChange={searchHashtags}
        />

        <ThemedButton
          className='mb-2 h-10 w-full py-0.5 text-lg'
          variant='flat'
          color='primary'
          disabled={!title}
          loading={submitting}
          spinnerSize='xs'
          onClick={submit}
        >
          {newPost ? '게시' : '수정'}
        </ThemedButton>
      </div>
    </>
  )
}
