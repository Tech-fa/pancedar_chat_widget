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

/** Whole string literal (quotes included) is replaced with JSON.stringify(html). */
const PH_EMBEDDED_TEMPLATE = '"___CHAT_WIDGET_EMBEDDED_TEMPLATE___"'
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

function injectPlaceholders(source, env, embeddedTemplateLiteral) {
    const api = env.VITE_API_URL ?? ''
    return source
        .replaceAll(PH_EMBEDDED_TEMPLATE, embeddedTemplateLiteral)
        .replaceAll(PH_API_URL, api)
}

function main() {
    const fileEnv = parseEnvFile(path.join(ROOT, '.env'))
    const env = { ...fileEnv, ...process.env }

    const srcJs = path.join(ROOT, 'src', 'chat-widget.js')
    const srcTpl = path.join(ROOT, 'public', 'chat-widget.template.html')
    const distDir = path.join(ROOT, 'dist')

    fs.mkdirSync(distDir, { recursive: true })

    const raw = fs.readFileSync(srcJs, 'utf8')
    const templateHtml = fs.readFileSync(srcTpl, 'utf8')
    const embeddedTemplateLiteral = JSON.stringify(templateHtml)
    fs.writeFileSync(
        path.join(distDir, 'chat-widget.js'),
        injectPlaceholders(raw, env, embeddedTemplateLiteral),
        'utf8',
    )
    fs.copyFileSync(srcTpl, path.join(distDir, 'chat-widget.template.html'))

    console.log('Wrote dist/chat-widget.js and dist/chat-widget.template.html')
}

main()
