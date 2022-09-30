import type { CellSuccessProps, CellFailureProps } from '@redwoodjs/web'

import { UserFormTeams } from '../UserFormTeams'

export const QUERY = gql`
  query UserFormTeams {
    teams {
      id
      name
    }
    roles {
      id
      name
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error.message}</div>
)

export const Success = (props: CellSuccessProps) => <UserFormTeams {...props} />
