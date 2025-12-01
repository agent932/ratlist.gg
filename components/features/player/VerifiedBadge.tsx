import Link from 'next/link'

type VerifiedBadgeProps = {
  username: string
  linkedAt?: string
}

export function VerifiedBadge({ username, linkedAt }: VerifiedBadgeProps) {
  return (
    <Link
      href={`/user/${username}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm font-semibold text-green-400 hover:bg-green-500/20 transition-colors"
      title={`This player is verified by ${username}${linkedAt ? ` since ${new Date(linkedAt).toLocaleDateString()}` : ''}`}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Verified by {username}</span>
    </Link>
  )
}
