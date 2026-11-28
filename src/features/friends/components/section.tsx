import type { ReactNode } from 'react'

type SectionProps = {
	title: string
	children: ReactNode
}

export default function Section({ title, children }: SectionProps) {
	return (
		<section className="flex flex-col gap-2.5">
			<h2 className="text-mist text-sm font-medium">{title}</h2>

			{children}
		</section>
	)
}
