#!/usr/bin/env node
/**
 * Replaces the same placeholders as web_dashboard's vite `chat-widget-env-inject` plugin.
 * Reads optional `.env` next to package.json; process.env wins for CI/overrides.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const PH_TEMPLATE_HOST = '__VITE_CHAT_WIDGET_TEMPLATE_HOST__'
const PH_API_URL = '__VITE_API_URL__'

function parseEnvFile(filePath) {
    const out = {}
    let text
    try {
        text = fs.readFileSync(filePath, 'utf8')
    } catch {
        return out
    }
    for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq <= 0) continue
        const key = trimmed.slice(0, eq).trim()
        let val = trimmed.slice(eq + 1).trim()
        if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
        ) {
            val = val.slice(1, -1)
        }
        out[key] = val
    }
    return out
}

function injectPlaceholders(source, env) {
    const host = env.VITE_CHAT_WIDGET_TEMPLATE_HOST ?? ''
    const api = env.VITE_API_URL ?? ''
    return source.replaceAll(PH_TEMPLATE_HOST, host).replaceAll(PH_API_URL, api)
}

function main() {
    const fileEnv = parseEnvFile(path.join(ROOT, '.env'))
    const env = { ...fileEnv, ...process.env }

    const srcJs = path.join(ROOT, 'src', 'chat-widget.js')
    const srcTpl = path.join(ROOT, 'public', 'chat-widget.template.html')
    const distDir = path.join(ROOT, 'dist')

    fs.mkdirSync(distDir, { recursive: true })

    const raw = fs.readFileSync(srcJs, 'utf8')
    fs.writeFileSync(path.join(distDir, 'chat-widget.js'), injectPlaceholders(raw, env), 'utf8')
    fs.copyFileSync(srcTpl, path.join(distDir, 'chat-widget.template.html'))

    console.log('Wrote dist/chat-widget.js and dist/chat-widget.template.html')
}

main()
