import { ChevronLeft } from 'lucide-react'

import Link from '@/components/ui/link'

type ReturnProps = {
	to: string
	label: string
}

export default function Return({ to, label }: ReturnProps) {
	return (
		<Link
			to={to}
			variant="muted"
			className="flex items-center gap-1 self-start"
		>
			<ChevronLeft size={20} />
			{label}
		</Link>
	)
}
