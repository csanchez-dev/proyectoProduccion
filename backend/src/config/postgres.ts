import { connect } from 'node:http2'
import { Pool} from 'pg'


const config = {
    host: 'localhost',
    user: 'postgres',
    password: '123456',
    database: 'usuarios_coniiti',
    port: 5432,
}

const client = new Pool(config)

async function connectDB() {
    try {
        await client.connect()
         console.log('Conectado a PostgreSQL usuarios_coniiti')
    } catch (error) {
        console.error('Error de conexión:', error)
    }
}

connectDB()