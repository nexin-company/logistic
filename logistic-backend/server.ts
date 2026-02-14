import app from './api/index.js'
import { runMigrations } from './src/migrations.js'

const port = Number(process.env.PORT || 8004)

await runMigrations()

app.listen(port, () => {
  console.log(`🚀 Logistics Backend escuchando en http://localhost:${port}`)
})

