export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const email = config.apiAuthEmail
    const password = config.apiAuthPassword
    const apiUrl = config.apiUrl

    const authHeader = Buffer.from(`${email}:${password}`).toString('base64')

    const body = await readBody(event)
    console.log('KQL Request body:', JSON.stringify(body, null, 2))

    if (!body) {
        throw createError({ statusCode: 400, message: 'Missing request body' })
    }

    // Retry logic for PHP built-in server limitations
    const maxRetries = 3
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const dataApi = await $fetch(`${apiUrl}/api/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authHeader}`,
                    'Content-Type': 'application/json'
                },
                body,
            })

            console.log('dataApi', dataApi)
            return dataApi
        } catch (error: any) {
            lastError = error
            // Log detailed error info
            console.warn(`KQL request attempt ${attempt}/${maxRetries} failed:`, {
                message: error.message,
                statusCode: error.statusCode,
                data: error.data,
                response: error.response?._data
            })

            // Only retry on 400 errors (PHP server overload)
            if (error.statusCode !== 400 || attempt === maxRetries) {
                throw error
            }

            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 100 * attempt))
        }
    }

    throw lastError
})
