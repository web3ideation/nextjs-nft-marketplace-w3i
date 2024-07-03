const { execSync } = require("child_process")
const fs = require("fs")
const json2md = require("json2md")

const runCommand = (command) => {
    try {
        return execSync(command, { encoding: "utf-8" })
    } catch (error) {
        console.error(`Error executing command: ${command}`, error)
        return null
    }
}

const licensesOutput = runCommand("npx license-checker --json")
if (!licensesOutput) {
    console.error("Failed to get licenses information.")
    process.exit(1)
}

const licensesJson = JSON.parse(licensesOutput)
const packages = Object.keys(licensesJson).map((pkg) => {
    const data = licensesJson[pkg]
    return {
        name: pkg,
        version: data.version,
        license: data.licenses,
        repository: data.repository,
    }
})

const mdContent = packages.map((pkg) => ({
    h2: pkg.name,
    ul: [`Version: ${pkg.version}`, `Lizenz: ${pkg.license}`, `Repository: [${pkg.repository}](${pkg.repository})`],
}))

const markdown = json2md([{ h1: "Lizenzen der Abhängigkeiten" }, ...mdContent])

fs.writeFileSync("LICENSES.md", markdown)

console.log("LICENSES.md erfolgreich erstellt.")
