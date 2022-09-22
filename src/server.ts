import express from  'express'
import cors from 'cors'
import { PrismaClient} from '@prisma/client'
import convertHourStringToMinutos from '../src/ultis/convert-hour-string-to-minute'
import convertMinutesStringToHour from './ultis/covert-minutes-to-hours'


const app = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient()

app.get('/games',async (request, response) =>{
    const games = await prisma.game.findMany({
        include:{
            _count:{
                select:{
                    Ads: true,
                }
            }
        }
    })
    return response.json(games);
})

app.post('/games/:id/ads', async (request, response) =>{
    const gameId = request.params.id
    const body: any = request.body
    console.log(body)
    const ad = await prisma.ad.create({
        
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHourStringToMinutos(body.hourStart),
            hourEnd: convertHourStringToMinutos(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel

        }
    })

    return response.status(201).json({ad})
})


app.get('/games/:id/ads', async (request, response) =>{
    const gameId = request.params.id

    const ads = await prisma.ad.findMany({
        select:{
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            hourStart: true,
            hourEnd: true,
            yearsPlaying:  true,
        },
        where:{
            gameId,
        },
        orderBy:{
            createdAt: 'desc'
        }
    })

    return response.json(ads.map(ad => {
        return{
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart:  convertMinutesStringToHour(ad.hourStart),
            hourEnd:  convertMinutesStringToHour(ad.hourEnd)
        }
    })
        
       
    )
})
app.get('/ads/:id/discord', async (request, response) =>{
   
    const adId= request.params.id
    const ad = await prisma.ad.findUniqueOrThrow({
        select:{
            discord: true
        },
        where:{
            id: adId
        }
    })

    response.json({
        discord: ad?.discord
       
    })
})

app.listen(8080, ()=>{
    console.log('Servidor iniciado sem intercorrencia')
})

