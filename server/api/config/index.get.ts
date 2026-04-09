import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { settings } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const displayNameResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'displayName')
  })
  
  const sitePasswordResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'sitePassword')
  })

  const siteNameResult = await db.query.settings.findFirst({
    where: eq(settings.key, 'siteName')
  })
  
  return {
    displayName: displayNameResult?.value || 'Jolt Posts',
    sitePassword: sitePasswordResult?.value || '',
    siteName: siteNameResult?.value || 'Jolt Posts'
  }
})