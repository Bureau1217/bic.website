export default defineEventHandler(async (event) => {// console.log('data', data)

    const email = process.env.API_AUTH_EMAIL
    const password = process.env.API_AUTH_PASSWORD

    const authHeader = Buffer.from(`${email}:${password}`).toString('base64')

    const body = await readBody(event)

    const dataApi = await $fetch(`${process.env.API_URL}/api/query`, {
        lazy: true,
        method: 'POST',
        headers: {
            'Authorization': `Basic ${authHeader}`
        },
        body,
    })

    console.log('dataApi', dataApi)

    return dataApi
})


