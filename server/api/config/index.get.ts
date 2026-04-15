import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { settings } from '../../db/schema'

export default defineEventHandler(async (_event) => {
  const displayNameResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'displayName')
  })
  
  const sitePasswordResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'sitePassword')
  })

  const siteNameResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'siteName')
  })

  const avatarPathResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'avatarPath')
  })

  const commentsEnabledResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'commentsEnabled')
  })

  const commentsModeratedResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'commentsModerated')
  })
  
  return {
    displayName: displayNameResult?.value || 'Jolt Posts',
    sitePassword: sitePasswordResult?.value || '',
    siteName: siteNameResult?.value || 'Jolt Posts',
    avatarPath: avatarPathResult?.value || '',
    commentsEnabled: commentsEnabledResult?.value === 'true',
    commentsModerated: commentsModeratedResult?.value === 'true'
  }
})