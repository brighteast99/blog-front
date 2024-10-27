import { useMemo, useState } from 'react'
import clsx from 'clsx'

import { useLazyQuery, useQuery } from '@apollo/client'
import { GET_TEMPLATE, GET_TEMPLATES } from 'api/template'

import { useAppSelector } from 'store/hooks'
import { selectIsAuthenticatedAndActive } from 'store/slices/auth/authSlice'

import { mdiPound } from '@mdi/js'
import { Badge } from 'components/Badge'
import { ThemedButton } from 'components/Buttons/ThemedButton'
import { Error } from 'components/Error'
import { PopoverMenu } from 'components/PopoverMenu'
import { Spinner } from 'components/Spinner'
import { Tiptap } from 'components/Tiptap'

import type { FC, ReactNode } from 'react'
import type { Placement } from '@floating-ui/react'
import type { Template } from 'types/data'

interface TemplateSelectorProps {
  className?: string
  placement?: Placement
  tooltipPlacement?: Placement
  description?: string
  children?: ReactNode
  onSelect?: (data: Template) => any
}

export const TemplateSelector: FC<TemplateSelectorProps> = ({
  className,
  placement = 'bottom-end',
  tooltipPlacement = 'bottom',
  description,
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const isLoggedIn = useAppSelector(selectIsAuthenticatedAndActive)

  const {
    data: templatesData,
    loading: loadingTemplates,
    error: errorLoadingTemplates,
    refetch: refetchTemplates
  } = useQuery(GET_TEMPLATES, {
    notifyOnNetworkStatusChange: true,
    skip: !isLoggedIn
  })
  const templates = useMemo(() => templatesData?.templates, [templatesData])

  const [
    loadTemplate,
    {
      data: templateData,
      loading: loadingTemplate,
      error: errorLoadingTemplate,
      refetch: refetchTemplate
    }
  ] = useLazyQuery(GET_TEMPLATE, { notifyOnNetworkStatusChange: true })
  const template = useMemo(() => templateData?.template, [templateData])

  const [selectedTemplate, setSelectedTemplate] = useState<number>()

  return (
    <PopoverMenu
      className={className}
      open={isOpen}
      placement={placement}
      offset={-32}
      tooltipPlacement={tooltipPlacement}
      description={description}
      menuBtn={
        <ThemedButton
          className='h-8 px-2'
          variant='flat'
          disabled={!templates?.length}
          loading={loadingTemplates}
          spinnerSize='xs'
          color='primary'
        >
          {`템플릿 ${templates?.length ? '' : '없음'}`}
        </ThemedButton>
      }
      onOpen={() => setIsOpen(true)}
      onClose={() => {
        setIsOpen(false)
        setSelectedTemplate(undefined)
      }}
    >
      <div className='w-120 max-w-[90dvw] bg-neutral-50'>
        <div className='relative flex max-h-40 flex-col'>
          {loadingTemplates && <Spinner className='absolute inset-0 m-auto' />}
          {errorLoadingTemplates && (
            <div className='absolute inset-0'>
              <Error
                code={500}
                hideDefaultAction
                actions={[{ label: '다시 시도', handler: refetchTemplates }]}
              />
            </div>
          )}
          {templates && (
            <ul className='min-h-0 grow overflow-y-auto px-2 py-1.5'>
              {templates.map((template) => (
                <li
                  className={clsx(
                    'px-1 py-0.5 text-neutral-600 transition-colors',
                    selectedTemplate === template.id
                      ? 'text-primary'
                      : 'hover:text-foreground'
                  )}
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    loadTemplate({ variables: { id: template.id } })
                  }}
                >
                  {template.templateName}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedTemplate && (
          <div className='relative flex h-100 flex-col border-t border-neutral-200'>
            {loadingTemplate && <Spinner className='absolute inset-0 m-auto' />}
            {errorLoadingTemplate && (
              <div className='absolute inset-0'>
                <Error
                  code={500}
                  hideDefaultAction
                  actions={[{ label: '다시 시도', handler: refetchTemplate }]}
                />
              </div>
            )}
            {template && (
              <>
                <div className='border-b border-dashed border-neutral-200 py-1.5 text-center'>
                  {template.title}
                </div>
                <Tiptap
                  className='-mx-2 my-2 flex-grow overflow-y-auto'
                  editable={false}
                  content={template.content}
                />
                <div className='flex min-h-9 flex-wrap items-center gap-0.5 border-t border-dashed border-neutral-200 p-1'>
                  {template.tags.map((tag) => (
                    <Badge key={tag} size='xs' icon={mdiPound}>
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length === 0 && (
                    <span className='text-sm text-neutral-600'>
                      태그 미지정
                    </span>
                  )}
                </div>
                <ThemedButton
                  className='rounded-t-none py-1'
                  color='primary'
                  variant='flat'
                  onClick={() => {
                    setSelectedTemplate(undefined)
                    onSelect?.(template)
                    setIsOpen(false)
                  }}
                >
                  사용
                </ThemedButton>
              </>
            )}
          </div>
        )}
      </div>
    </PopoverMenu>
  )
}
