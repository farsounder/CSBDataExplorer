'use server'
 
import { revalidatePath } from 'next/cache'

// TODO: this can be tag based so we can make it just refresh the cache for the
// platform query, tbd 
export default async function forceRefresh() {
  revalidatePath('/')
}