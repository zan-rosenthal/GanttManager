import { db } from 'src/lib/db'

import { users, user, createUser, updateUser, removeUser } from './users'
import type { AssociationsScenario, StandardScenario } from './users.scenarios'

describe('users', () => {
  scenario('returns all users', async (scenario: StandardScenario) => {
    const result = await users()

    expect(result.length).toEqual(Object.keys(scenario.user).length)
  })

  scenario('returns a single user', async (scenario: StandardScenario) => {
    const result = await user({ id: scenario.user.one.id })

    expect(result).toEqual(scenario.user.one)
  })

  describe('creates', () => {
    scenario('when no teams', async () => {
      const before = new Date()
      const result = await createUser({
        input: {
          active: true,
          admin: false,
          email: 'String4652567',
        },
      })

      expect(result.active).toEqual(true)
      expect(result.admin).toEqual(false)
      expect(result.email).toEqual('String4652567')
      expect(result.hashedPassword).toBeTruthy()
      expect(result.salt).toBeTruthy()
      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      )
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      )
    })

    scenario(
      'associations',
      'when adding teams and roles',
      async (scenario: AssociationsScenario) => {
        const teamId = scenario.team.team1.id
        const roleId = scenario.role.role1.id
        const result = await createUser({
          input: {
            active: true,
            admin: false,
            email: 'String4652567',
            teamIds: [teamId],
            roleIds: [`${teamId},${roleId}`],
          },
        })

        const membership = await db.membership.findUnique({
          where: {
            userTeamConstraint: {
              teamId: scenario.team.team1.id,
              userId: result.id,
            },
          },
        })
        expect(membership).not.toEqual(null)

        const membershipRoles = await db.membershipRole.findMany({
          where: { membershipId: membership.id, roleId: roleId },
        })
        expect(membershipRoles.length).toEqual(1)
      }
    )
  })

  describe('updates', () => {
    scenario(
      'associations',
      'when no teams',
      async (scenario: AssociationsScenario) => {
        const original = await user({ id: scenario.user.withoutTeam.id })
        const before = new Date()
        const result = await updateUser({
          id: original.id,
          input: { email: 'String61961682' },
        })

        expect(result.email).toEqual('String61961682')
        expect(result.createdAt.getTime()).toBeLessThan(before.getTime())
        expect(result.updatedAt.getTime()).toBeGreaterThan(before.getTime())
      }
    )

    scenario(
      'associations',
      'when adding teams and roles',
      async (scenario: AssociationsScenario) => {
        const id = scenario.user.withoutTeam.id
        const teamId = scenario.team.team1.id
        const teamIds = [scenario.team.team1.id]
        const roleId = scenario.role.role1.id
        const roleIds = [`${teamId},${roleId}`]

        const result = await updateUser({
          id,
          input: {
            roleIds,
            teamIds,
          },
        })

        const membership = await db.membership.findUnique({
          where: {
            userTeamConstraint: {
              teamId,
              userId: result.id,
            },
          },
        })
        expect(membership).not.toEqual(null)

        const membershipRoles = await db.membershipRole.findMany({
          where: { membershipId: membership.id, roleId },
        })
        expect(membershipRoles.length).toEqual(1)
      }
    )

    scenario(
      'associations',
      'when remove a team with roles',
      async (scenario: AssociationsScenario) => {
        const original = await user({ id: scenario.user.withTeam.id })

        const result = await updateUser({
          id: original.id,
          input: { teamIds: [] },
        })

        const membership = await db.membership.findUnique({
          where: {
            userTeamConstraint: {
              teamId: scenario.team.team1.id,
              userId: result.id,
            },
          },
        })

        expect(membership).toEqual(null)
      }
    )
    scenario(
      'associations',
      'when user has teams but teams not passed',
      async (scenario: AssociationsScenario) => {
        const original = await user({ id: scenario.user.withTeam.id })

        const result = await updateUser({
          id: original.id,
          input: {},
        })

        const membership = await db.membership.findUnique({
          where: {
            userTeamConstraint: {
              teamId: scenario.team.team1.id,
              userId: result.id,
            },
          },
        })

        expect(membership).not.toEqual(null)
      }
    )
  })

  scenario('removes a user', async (scenario: StandardScenario) => {
    const original = await removeUser({ id: scenario.user.one.id })
    const result = await user({
      id: original.id,
    })
    expect(result.email).toEqual(result.id)
    expect(result.name).toEqual('Removed User')
    expect(result.nickname).toEqual(null)
    expect(result.pronouns).toEqual(null)
    expect(result.active).toEqual(false)
    expect(result.admin).toEqual(false)
  })
})
