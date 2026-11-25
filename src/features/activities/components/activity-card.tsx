import type { ReactNode } from 'react'

import type { Activity } from '@/features/activities/lib/activity'
import { getActivityPhotoUrl } from '@/features/activities/lib/activity-photo'
import { formatDate } from '@/features/competitions/lib/competition-dates'
import type { Profile } from '@/features/profile/lib/use-profile'

import { formatDuration, formatNumber } from '@/lib/format'

type ActivityCardProps = {
	activity: Activity
	author?: Profile
	children?: ReactNode
}

export default function ActivityCard({
	activity,
	author,
	children,
}: ActivityCardProps) {
	const photoUrl = getActivityPhotoUrl(activity.photo_path)

	const details = [
		`${formatNumber(activity.distance)} km`,
		formatDuration(activity.duration),
		activity.elevation_gain > 0 &&
			`+${formatNumber(activity.elevation_gain)} m`,
		activity.steps !== null && `${formatNumber(activity.steps)} pas`,
	]
		.filter(Boolean)
		.join(' · ')

	return (
		<div className="bg-graphite border-slate flex items-center gap-2.5 rounded-xl border p-2.5">
			<a
				href={photoUrl}
				target="_blank"
				rel="noreferrer"
				className="shrink-0 transition-opacity active:opacity-50"
			>
				<img
					src={photoUrl}
					alt=""
					loading="lazy"
					className="bg-slate size-16 rounded-lg object-cover"
				/>
			</a>

			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate font-medium">{activity.name}</span>

				<span className="text-mist truncate text-sm">
					{author && `${author.full_name} · `}
					{formatDate(activity.activity_date)}
				</span>

				<span className="truncate text-sm">{details}</span>
			</div>

			{children}
		</div>
	)
}
