const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

const startServer = (port) => {
    app.prepare().then(() => {
        const server = createServer((req, res) => {
            const parsedUrl = parse(req.url, true)
            handle(req, res, parsedUrl)
        })

        server.listen(port, (err) => {
            if (err) {
                if (err.code === "EADDRINUSE") {
                    console.log(`Port ${port} is in use, trying next port...`)
                    startServer(port + 1) // Try next port
                } else {
                    throw err
                }
            } else {
                console.log(`> Ready on http://localhost:${port}`)
            }
        })
    })
}

// Start trying from port 4000
const initialPort = 4000
startServer(initialPort)
