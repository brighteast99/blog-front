import { useMemo, useState } from 'react'
import clsx from 'clsx'

import { useLazyQuery, useQuery } from '@apollo/client'
import { GET_TEMPLATE, GET_TEMPLATES } from './api'

import { useToggle } from 'hooks/useToggle'

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
  const { value: isOpen, setTrue: open, setFalse: close } = useToggle(false)

  const {
    data: templatesData,
    loading: loadingTemplates,
    error: errorLoadingTemplates,
    refetch: refetchTemplates
  } = useQuery(GET_TEMPLATES, { notifyOnNetworkStatusChange: true })
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
      offset={12}
      tooltipPlacement={tooltipPlacement}
      description={description}
      menuBtn={
        <ThemedButton
          className='h-8 px-2'
          variant='flat'
          disabled={loadingTemplates}
          color='primary'
        >
          {loadingTemplates ? <Spinner size='xs' /> : '템플릿'}
        </ThemedButton>
      }
      onOpen={open}
      onClose={close}
    >
      <div className='w-120 max-w-[90dvw] bg-neutral-50'>
        <div className='relative flex h-40 flex-col'>
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
            <ul className='min-h-0 grow overflow-y-auto p-1'>
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
                  {template.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedTemplate && (
          <div className='relative flex h-100 flex-col border-t border-neutral-100'>
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
                <Tiptap
                  className='-mx-2 my-2 flex-grow overflow-y-auto'
                  editable={false}
                  content={template.content}
                />
                <ThemedButton
                  className='rounded-t-none py-1'
                  color='primary'
                  variant='flat'
                  onClick={() => {
                    setSelectedTemplate(undefined)
                    onSelect?.(template)
                    close()
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
