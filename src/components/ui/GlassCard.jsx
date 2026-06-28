import clsx from 'clsx'

export default function GlassCard({ children, className = '', raised = true, inset = false, as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={clsx(
        inset ? 'glass-inset' : 'glass',
        raised && !inset && 'glass-raised',
        'p-5',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
