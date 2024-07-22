import { FC, ReactNode, useState } from 'react'

import { useLazyQuery, useQuery } from '@apollo/client'
import { Placement } from '@floating-ui/react'
import clsx from 'clsx'

import { GET_TEMPLATE, GET_TEMPLATES } from 'pages/manage/Templates'

import { ThemedButton } from 'components/Buttons/ThemedButton'
import { PopoverMenu } from 'components/PopoverMenu'
import { Spinner } from 'components/Spinner'
import { Tiptap } from 'components/Tiptap'

import { Template } from 'types/data'

export interface TemplateSelectorProps {
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
  const { data: templates, loading: loadingList } = useQuery(GET_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<number>()
  const [loadTemplateInfo, { loading: loadingTemplate, data: template }] =
    useLazyQuery(GET_TEMPLATE, {
      fetchPolicy: 'cache-and-network'
    })
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <PopoverMenu
      className={className}
      open={isOpen}
      placement={placement}
      offset={12}
      tooltipPlacement={tooltipPlacement}
      description={description}
      menuBtn={
        <ThemedButton
          className='h-8 px-2'
          variant='flat'
          disabled={loadingList}
          color='primary'
        >
          {loadingList ? <Spinner size='xs' /> : '템플릿'}
        </ThemedButton>
      }
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    >
      <div className='w-120 max-w-[90dvw] bg-neutral-50'>
        <div className='flex h-40 flex-col border-b border-neutral-100'>
          <div className='border-b border-neutral-100 bg-neutral-100 py-1 text-center'>
            템플릿 목록
          </div>
          <ul className='min-h-0 grow overflow-y-auto'>
            {templates?.templates.map((template) => (
              <li
                className={clsx(
                  'px-1 py-0.5',
                  selectedTemplate === template.id
                    ? 'bg-primary bg-opacity-25 hover:brightness-125'
                    : 'hover:bg-background'
                )}
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id)
                  loadTemplateInfo({ variables: { id: template.id } })
                }}
              >
                {template.title}
              </li>
            ))}
          </ul>
        </div>

        {selectedTemplate && (
          <div className='relative flex h-100 flex-col'>
            {loadingTemplate || !template ? (
              <Spinner className='absolute inset-0 m-auto' />
            ) : (
              <>
                <Tiptap
                  className='-mx-2 my-2 flex-grow overflow-y-auto'
                  editable={false}
                  content={template.template.content}
                />
                <ThemedButton
                  className='rounded-t-none py-1'
                  color='primary'
                  variant='flat'
                  onClick={() => {
                    setSelectedTemplate(undefined)
                    onSelect?.(template.template)
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
