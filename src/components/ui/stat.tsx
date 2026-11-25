type StatProps = {
	label: string
	value: string
}

export default function Stat({ label, value }: StatProps) {
	return (
		<div className="bg-graphite border-slate flex flex-col gap-0.5 rounded-xl border p-2.5">
			<span className="text-mist text-sm">{label}</span>
			<span className="text-xl font-semibold">{value}</span>
		</div>
	)
}
