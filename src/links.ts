import "./styles/global.css"
import "./styles/links.css"

import { initWhatsappLinks } from "./components/nav"

const WHATSAPP_NUMBER = "5511983202462"
const WHATSAPP_MESSAGE = "Olá! Vim pelos links rápidos da ConstelaTech e quero saber mais."

initWhatsappLinks(WHATSAPP_NUMBER, WHATSAPP_MESSAGE)
